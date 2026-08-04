# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

E-commerce (Português-BR) with a **FastAPI (Python)** backend and a **React + TypeScript (Vite)** frontend, living in `backend/` and `frontend/` respectively. Local dev DB is **SQLite** (`backend/ecommerce.db`, auto-created); production target is PostgreSQL via `docker-compose.yml`.

## Commands

### Backend (`cd backend`)
```bash
python -m venv venv && venv\Scripts\activate      # Windows
pip install -r requirements.txt
python main.py                                     # run server, http://localhost:8000 (docs at /docs, /redoc)
uvicorn main:app --reload                           # alternative with autoreload
python seed_db.py                                   # seed the DB with sample data
pytest tests/ -v                                    # run all tests
pytest tests/test_api.py -v                          # run one test file
pytest tests/test_api.py::test_name -v               # run a single test
pytest tests/ -v --cov                               # with coverage
black . && flake8                                    # format / lint (per CONTRIBUTING.md; no config files present)
```
Tests use a separate SQLite file (`test.db`) via `tests/conftest.py`, which overrides FastAPI's `get_db` dependency and auto-seeds two products for the whole test session (see `seed_test_db` fixture, session-scoped/autouse).

### Frontend (`cd frontend`)
```bash
npm install
npm run dev            # Vite dev server, http://localhost:5173, proxies /api -> http://localhost:8000
npm run build           # tsc + vite build
npm run lint             # eslint
npm run type-check        # tsc --noEmit
npm test                  # vitest
```

### Docker (from repo root)
```bash
docker-compose up -d    # postgres:5432 + backend:8000 + frontend:5173
```

## Architecture

### Backend: layered, dict-returning services
`main.py` builds the FastAPI app, creates all tables via `Base.metadata.create_all` (no Alembic migrations — schema changes happen by editing SQLAlchemy models directly), configures CORS from `ALLOWED_ORIGINS` env var, and mounts `app.api.api_router`.

Request flow is **route → service → dict**, consistently:
- `app/api/*.py` — route handlers (thin), one router per resource (`auth`, `products`, `cart`, `orders`, `reviews`, `wishlist`, `categories`), each with its own `APIRouter(prefix="/api/...")`, aggregated in `app/api/__init__.py`.
- `app/services/*.py` — all business logic (`ProductService`, `OrderService`, etc.), all static methods. Services query `app/models` (SQLAlchemy ORM) directly and hand back **plain dicts** built by private `_x_to_dict` helpers rather than ORM instances — this sidesteps Pydantic/SQLAlchemy relationship-serialization issues. When adding a service method, follow this dict-building convention rather than returning ORM objects.
- `app/schemas/*.py` — Pydantic request/response models, used for route `response_model=` and body validation only.
- `app/models/*.py` — SQLAlchemy models; `app/models/__init__.py` re-exports `Base` + all models and must be updated whenever a model is added (it's also what `main.py` imports to register tables).
- `app/auth/` — `jwt.py` has `JWTHandler` (create/verify HS256 tokens) and `PasswordHandler` (bcrypt); `dependencies.py` has FastAPI dependencies `get_current_user`, `get_current_admin`, `get_optional_user`, all reading a raw `Authorization: Bearer <token>` header (no OAuth2PasswordBearer scheme).
- `app/middleware/error_handler.py` — global exception handling, wired in `main.py` as a `BaseHTTPMiddleware` plus a `RequestValidationError` handler.

Orders/payments are **simulated**, not integrated with a real gateway: `OrderService.PaymentSimulator.process_payment` auto-approves PIX and approves cards ~80% of the time (`random.random() < 0.8`). `OrderService.create_order` snapshots cart → order/order_items, decrements `Product.stock`, updates `User.total_orders`/`total_spent`, and clears the cart, all in one DB transaction before `commit()`.

### Frontend: routed SPA — mind the two App files
`frontend/src/main.tsx` renders **`App_new.tsx`**, not `App.tsx`. `App.tsx` is a dead/legacy static-placeholder page kept in the tree but never imported — don't edit it expecting it to affect the running app; treat `App_new.tsx` as the real root (it wires `react-router-dom` routes to every page in `src/pages/` behind `Header`/`Footer` from `components/layout`, and gates `/admin` on `isAuthenticated && user?.is_admin`).

- `store/` — Zustand stores (`authStore`, `cartStore`, `productStore`), re-exported from `store/index.ts`. `authStore`'s `isAuthenticated`/`user` drive header UI and the admin route guard.
- `services/api.ts` — single Axios instance (`baseURL` from `VITE_API_URL`, default `http://localhost:8000/api`); request interceptor attaches `access_token` from `localStorage`; response interceptor auto-refreshes on 401 using `refresh_token`, then redirects to `/login` if refresh fails. Per-resource service objects (`authService`, `productService`, …) live in this same file.
- Path alias `@` → `src/` (configured in `vite.config.ts`); dev server proxies `/api` to the backend on port 8000.
- Styling: Tailwind CSS + Framer Motion + `react-hot-toast` for toasts; design tokens (colors, spacing) are documented in `.instructions.md`.

### Known repo quirks
- Several one-off scripts sit at the **repo root** (`wishlist.py`, `wishlist_service.py`, `write_admin.py`, `write_card.js`, `write_home.js`, `implement.js`, `fix_admin.py`, `seed_api.py`, `test_wishlist_api.py`) — these are ad-hoc codegen/patch scripts from earlier sessions (e.g. `write_admin.py` regenerates `frontend/src/pages/AdminDashboard.tsx` from an embedded string). They are **not** part of the running app; the canonical code is under `backend/app/...` and `frontend/src/...`. Don't confuse `wishlist.py` at root with the real `backend/app/api/wishlist.py`.
- `.env.example` (root) and per-package `.env.example` files define `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`, SMTP vars; copy to `.env` before running.
- Docs describing intended structure/endpoints live in `.instructions.md`, `INSTRUÇÕES_EXECUÇÃO.md`, and `docs/` — cross-check against actual code since these were written ahead of implementation and may drift.
