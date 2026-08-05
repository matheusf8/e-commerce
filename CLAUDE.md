# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-commerce (Português-BR) with a **FastAPI (Python)** backend and a **React + TypeScript (Vite)** frontend, living in `backend/` and `frontend/` respectively. Local dev DB is **SQLite** (`backend/ecommerce.db`, auto-created); production target is PostgreSQL via `docker-compose.yml`. Git-versioned (GitHub: `matheusf8/e-commerce`), commit messages document the reasoning behind non-obvious changes in detail — check `git log` before re-investigating something that looks odd.

## Commands

### Backend (`cd backend`)
```bash
python -m venv venv && venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py                                     # run server, http://localhost:8000 (docs at /docs, /redoc)
uvicorn main:app --reload                           # alternative with autoreload — see caveat below
python seed_db.py                                   # seed the DB: admin@example.com / admin123 + sample products
pytest tests/ -v                                    # run all tests
pytest tests/test_api.py -v                          # run one test file
pytest tests/test_api.py::test_name -v               # run a single test
pytest tests/ -v --cov                               # with coverage
black . && flake8                                    # format / lint (per CONTRIBUTING.md; no config files present)
alembic revision --autogenerate -m "mensagem"        # new migration after changing a model
alembic upgrade head                                  # apply pending migrations
```
Tests use a separate SQLite file (`test.db`) via `tests/conftest.py`, which overrides FastAPI's `get_db` dependency. The `seed_test_db` fixture (session-scoped, autouse) does `Base.metadata.drop_all` + `create_all` **every session** before reseeding — this is deliberate: tests mutate data (checkout decrements stock), so without the reset, re-running the suite without deleting `test.db` would make stock-dependent tests fail on the second run.

**`uvicorn --reload` caveat (Windows)**: the reload supervisor has been flaky in this environment (child process respawns with the old code still loaded, or silently fails to bind). If a code change doesn't seem to take effect, kill all `python` processes and start a single fixed process instead: `python -m uvicorn main:app --host 0.0.0.0 --port 8000` (no `--reload`).

### Frontend (`cd frontend`)
```bash
npm install
npm run dev            # Vite dev server, http://localhost:5173, proxies /api -> http://localhost:8000
npm run build           # tsc + vite build
npm run lint             # eslint (58+ pre-existing `no-explicit-any` warnings, not build-blocking)
npm run type-check        # tsc --noEmit
npm test                  # vitest (unit)
npm run test:e2e           # Playwright, real Chromium — see e2e/ below
npm run test:e2e:ui         # Playwright with the interactive UI runner
```

### E2E tests (`frontend/e2e/full-flow.spec.ts`)
Full customer + admin journey (register → browse → cart → checkout → order detail → admin CRUD) driven in a real Chromium browser via `@playwright/test`, against the **real running backend** (not mocked) — `playwright.config.ts` points `baseURL` at `http://localhost:5173`, so both `npm run dev` (frontend) and the backend must already be running before `npm run test:e2e`. Idempotent by design: dynamic data (emails, product names, review text) is suffixed with `Date.now()` so re-running the suite doesn't collide with data from a previous run. Admin form inputs in this codebase don't set `type="text"` or reliable `name` attributes, and `<label>` isn't `htmlFor`-linked to its `<input>` — the robust selector pattern used throughout the spec is `label:text-is("Nome") + input` (adjacent-sibling), not `input[type="text"]` or `getByLabel`.

### Docker (from repo root)
```bash
docker-compose up -d    # postgres:5432 + backend:8000 + frontend:5173
```

## Architecture

### Database migrations (Alembic)
`backend/alembic/` — `env.py` is wired to `app.config.settings.database_url` (same source the app itself reads, not a hardcoded URL) and `app.models.Base.metadata` (autogenerate-aware), and turns on SQLite batch mode automatically (`render_as_batch=... dialect.name == "sqlite"`) since SQLite can't `ALTER TABLE` directly — needed for any future migration that isn't a pure `CREATE TABLE`, like the bootstrap one. `main.py` only calls `Base.metadata.create_all` when `ENVIRONMENT=development` (local convenience); anything else is expected to run `alembic upgrade head` instead (already wired into `backend/start.sh`, used by the Docker image). `create_all` never alters existing tables — leaving it on in dev alongside Alembic is safe, it just never fires in non-dev environments.

### Backend: layered, dict-returning services
`main.py` builds the FastAPI app, configures CORS from `ALLOWED_ORIGINS` env var, and mounts `app.api.api_router`.

Request flow is **route → service → dict**, consistently:
- `app/api/*.py` — route handlers (thin), one router per resource (`auth`, `products`, `cart`, `orders`, `reviews`, `wishlist`, `categories`, `users`), each with its own `APIRouter(prefix="/api/...")`, aggregated in `app/api/__init__.py`. `users.py` is intentionally minimal — just `GET /users/count` (admin-only) for the admin dashboard stat card; there's no general user-management CRUD.
- `app/services/*.py` — all business logic (`ProductService`, `OrderService`, etc.), all static methods. Services query `app/models` (SQLAlchemy ORM) directly and hand back **plain dicts** built by private `_x_to_dict` helpers rather than ORM instances — this sidesteps Pydantic/SQLAlchemy relationship-serialization issues. When adding a service method, follow this dict-building convention rather than returning ORM objects.
- `app/schemas/*.py` — Pydantic request/response models, used for route `response_model=` and body validation only.
- `app/models/*.py` — SQLAlchemy models; `app/models/__init__.py` re-exports `Base` + all models and must be updated whenever a model is added (it's also what `main.py` imports to register tables).
- `app/auth/` — `jwt.py` has `JWTHandler` (create/verify HS256 tokens) and `PasswordHandler` (bcrypt); `dependencies.py` has FastAPI dependencies `get_current_user`, `get_current_admin`, `get_optional_user`, all reading a raw `Authorization: Bearer <token>` header (no OAuth2PasswordBearer scheme).
- `app/middleware/error_handler.py` — global exception handling, wired in `main.py` as a `BaseHTTPMiddleware` plus a `RequestValidationError` handler.

**Payment has two parallel paths**, both wired into `OrderService.create_order` via `order_data.payment_method`:
- `pix` / `credit_card` / `debit_card` → `PaymentSimulator.process_payment` (no real gateway): PIX always approves instantly, cards approve ~80% of the time (`random.random() < 0.8`), used purely for UX/demo purposes.
- `mercadopago` → real Mercado Pago Checkout Pro integration (SDK: `mercadopago` package). Order is created `payment_status="pending"` first (no simulator call), then `OrderService.create_mp_preference` builds the preference and returns `sandbox_init_point`/`init_point` to redirect the browser to. Two ways the order gets marked paid, both funnel through the shared `OrderService._apply_mp_payment_to_order`: (1) the frontend calling `OrderService.sync_mp_payment` after the user is redirected back (never trusts the redirect's query params — always re-fetches the definitive status from Mercado Pago's `/v1/payments/{id}` API), and (2) `POST /api/orders/webhook/mercadopago`, which Mercado Pago calls server-to-server (looked up via `external_reference` on the payment, not a user-scoped query — there's no logged-in user in that request) and is signature-verified via `MP_WEBHOOK_SECRET` (HMAC-SHA256 over MP's documented manifest format; verification is skipped with a logged warning if the secret isn't set, which is expected in local dev). Configured via `MP_ACCESS_TOKEN` in `.env` — **must be a `TEST-...` sandbox token, never `APP_USR-...` (production)**; see `docs/PAGAMENTO_MERCADO_PAGO.md` for how to obtain one (this specific Mercado Pago account doesn't expose a `TEST-` token on the normal "Credenciais de teste" page — getting one requires creating a test **Vendedor** account via "Contas de teste" and grabbing that fake account's own credentials). `auto_return` and the webhook's `notification_url` are only sent when `FRONTEND_URL`/`BACKEND_URL` are `https://` — both are meaningless (MP either rejects or can't reach them) against `localhost`.

`OrderService.create_order` (all payment methods) snapshots cart → order/order_items, decrements `Product.stock`, updates `User.total_orders`/`total_spent`, and clears the cart, all in one DB transaction before `commit()`. Whenever a payment lands on `completed` (immediately in `create_order`/`retry_payment`, or later via the MP paths above), an order-confirmation email fires through `EmailService`.

### Transactional email (`app/services/email_service.py`, Resend)
Three emails: welcome (`AuthService.register`), order confirmation (fires wherever `payment_status` transitions *into* `"completed"` — `_apply_mp_payment_to_order` tracks `was_already_completed` first so a retried webhook delivery doesn't resend it), and password reset. All share one branded HTML wrapper (`_base_layout`). Sending never raises into the caller — `_send()` catches everything and just logs, since a checkout or registration succeeding shouldn't depend on an email provider being up. Without `RESEND_API_KEY` set, every send is a no-op logged warning (this is the state in local dev — there's no way to "see" a sent email locally short of setting a real key).

**Password reset** (`AuthService.forgot_password`/`reset_password`, routes `POST /api/auth/forgot-password` and `/reset-password`): the reset token is a normal `JWTHandler.create_access_token` with an extra `"purpose": "password_reset"` claim and a 30-minute expiry, verified via `JWTHandler.verify_token_payload` (returns the full decoded payload, unlike `verify_token` which only returns `sub` — added specifically so a general-purpose token could carry the `purpose` claim without touching the normal login-token verification path). `forgot_password` always returns the same generic message regardless of whether the email is registered, to avoid user enumeration.

### Frontend: routed SPA
`frontend/src/main.tsx` renders `App.tsx`, which wires `react-router-dom` routes to every page in `src/pages/` behind `Header`/`Footer` from `components/layout`, and gates `/admin` on `isAuthenticated && user?.is_admin`.

- `store/` — Zustand stores (`authStore`, `cartStore`, `productStore`), re-exported from `store/index.ts`. `authStore`'s `isAuthenticated`/`user` drive header UI and the admin route guard.
- `services/api.ts` — single Axios instance (`baseURL` from `VITE_API_URL`, default `http://localhost:8000/api`); request interceptor attaches `access_token` from `localStorage`; response interceptor auto-refreshes on 401 using `refresh_token`, then redirects to `/login` if refresh fails. Per-resource service objects (`authService`, `productService`, `orderService`, …) live in this same file.
- Path alias `@` → `src/` (configured in `vite.config.ts`); dev server proxies `/api` to the backend on port 8000.
- Styling: Tailwind CSS + Framer Motion + `react-hot-toast` for toasts (never use native `alert()`/`confirm()` for anything other than a destructive-action confirm — it blocks the page and breaks Playwright).
- `pages/LegalPage.tsx` is a shared layout (title + "última atualização" + body) used by `Privacy.tsx`, `Terms.tsx`, `Cookies.tsx` — add new static legal-ish pages through it rather than duplicating the wrapper markup.
- Product image upload (`AdminDashboard.tsx`'s Cadastrar/Editar Produto forms) posts a `FormData` to `POST /api/products/upload-image` (Cloudinary-backed, admin-only, returns `{url}}` to drop into `image_url`). **Gotcha**: `services/api.ts`'s axios instance sets `Content-Type: application/json` globally; a `FormData` upload has to override that call with `headers: { 'Content-Type': undefined }` so the browser sets its own multipart header *with* the boundary param — hardcoding `'multipart/form-data'` instead silently breaks the upload (no boundary means the server can't parse the body).

### Known repo quirks
- `.env.example` (root) and per-package `.env.example` files define every env var the app reads (`DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `CLOUDINARY_*`, `RESEND_API_KEY`, `EMAIL_FROM`); copy to `.env` before running. `BACKEND_URL`/`FRONTEND_URL` being non-`https` is exactly what disables the Mercado Pago webhook/auto_return locally — that's expected, not a bug to chase.
- `docs/API.md` and `docs/ARCHITECTURE.md` are pre-existing reference docs that predate a lot of the actual implementation and have drifted (both carry a disclaimer at the top now) — treat Swagger (`/docs`) and this file as the sources of truth over them.
- Production deploy: `render.yaml` (repo root, backend + Postgres blueprint) and `frontend/vercel.json` (SPA rewrite, needed because `react-router`'s `BrowserRouter` 404s on a direct deep link without it) are checked in; the full walkthrough (env vars, domain DNS, switching Mercado Pago/Cloudinary/Resend to production) is [docs/DEPLOY.md](./docs/DEPLOY.md). `backend/start.sh` only runs `seed_db.py` when `SEED_DB=true` is set (opt-in, off by default — `docker-compose.yml` sets it for local dev convenience); this was previously an unconditional run on every boot, changed specifically so a client's real catalog can never be at risk of it. `start.sh`'s `uvicorn` no longer passes `--reload` (pointless/wasteful in a running container) and binds `${PORT:-8000}` so it also works unchanged on platforms that inject their own `PORT`.
- Remaining real gaps before this is truly ready to hand to a paying client: the deploy configs above haven't been exercised against a real Render/Vercel account yet (nobody has clicked deploy), and going live for an actual client still means *their* Mercado Pago production credentials, *their* domain, and rotating the seeded `admin@example.com`/`admin123` login — none of that can be done from inside the repo.
