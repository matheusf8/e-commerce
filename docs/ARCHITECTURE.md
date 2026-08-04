# 🏗️ Arquitetura do Projeto

> Documento conceitual: mostra as camadas e o fluxo de dados. Alguns nomes de
> arquivo abaixo são ilustrativos e podem não bater 1:1 com o código atual
> (ex: banco em uso local é SQLite, não Postgres; sem Redis/Alembic ainda).
> Para a estrutura real, veja o `CLAUDE.md` na raiz do repositório.

## Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                │
│  ┌───────────────────────────────────────────────┐  │
│  │  Frontend (React + TypeScript + Tailwind)     │  │
│  │  - Pages: Home, Catalog, Product, Cart, etc   │  │
│  │  - Components: Reutilizáveis, tipados         │  │
│  │  - Store: Zustand (estado global)             │  │
│  │  - Services: Chamadas HTTP com Axios          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↕ HTTP/REST
┌─────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)             │
│  ┌───────────────────────────────────────────────┐  │
│  │  API Routes (app/api/)                        │  │
│  │  - /api/auth    → Autenticação JWT            │  │
│  │  - /api/products → Produtos & Catálogo        │  │
│  │  - /api/cart    → Carrinho de compras         │  │
│  │  - /api/orders  → Pedidos                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Services (app/services/)                     │  │
│  │  - ProductService   → Lógica de produtos      │  │
│  │  - OrderService     → Lógica de pedidos       │  │
│  │  - AuthService      → Lógica de autenticação  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Schemas & Models (Pydantic + SQLAlchemy)    │  │
│  │  - Validação de entrada (Pydantic)           │  │
│  │  - ORM Models (SQLAlchemy)                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Middleware & Auth (app/auth/, middleware/)  │  │
│  │  - JWT Token validation                       │  │
│  │  - CORS, Error handling                       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↕ SQL
┌─────────────────────────────────────────────────────┐
│            Database (PostgreSQL)                    │
│  - Users (id, email, password_hash, ...)           │
│  - Products (id, name, price, stock, ...)          │
│  - Orders (id, user_id, total, status, ...)        │
│  - OrderItems (id, order_id, product_id, qty, ...) │
│  - CartItems (id, user_id, product_id, qty, ...)   │
│  - Reviews (id, product_id, user_id, rating, ...) │
└─────────────────────────────────────────────────────┘
```

## Fluxo de Autenticação

```
1. Usuário faz login
        ↓
2. Backend valida credenciais e gera JWT
        ↓
3. Frontend armazena token em Zustand (estado global)
        ↓
4. Todas as requisições incluem: Authorization: Bearer {token}
        ↓
5. Backend valida JWT em cada requisição
        ↓
6. Se expirado: Frontend usa refresh token para gerar novo access token
```

## Estrutura de Pastas Detalhada

```
backend/
├── main.py                    # Entry point da aplicação
├── app/
│   ├── __init__.py
│   ├── config.py              # Configurações globais
│   ├── api/                   # Rotas/Endpoints
│   │   ├── __init__.py
│   │   ├── auth.py            # POST /register, /login, /refresh
│   │   ├── products.py        # GET /products, POST /products (admin)
│   │   ├── orders.py          # POST /orders, GET /orders
│   │   └── cart.py            # POST /cart/items, DELETE /cart/items
│   ├── models/                # SQLAlchemy ORM Models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── product.py         # Product model
│   │   ├── order.py           # Order model
│   │   └── cart.py            # Cart model
│   ├── schemas/               # Pydantic validation schemas
│   │   ├── __init__.py
│   │   ├── user.py            # UserCreate, UserResponse
│   │   ├── product.py         # ProductCreate, ProductResponse
│   │   └── order.py           # OrderCreate, OrderResponse
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Lógica autenticação
│   │   ├── product_service.py # Lógica produtos
│   │   └── order_service.py   # Lógica pedidos
│   ├── db/                    # Database configuration
│   │   ├── __init__.py
│   │   ├── database.py        # SQLAlchemy connection
│   │   └── base.py            # Base declarative
│   ├── auth/                  # JWT & Security
│   │   ├── __init__.py
│   │   └── jwt.py             # Token creation/validation
│   └── middleware/            # HTTP middleware
│       ├── __init__.py
│       ├── cors.py            # CORS configuration
│       └── error_handler.py   # Global error handling
├── tests/                     # Testes com pytest
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_products.py
│   └── test_orders.py
├── requirements.txt
└── .env.example

frontend/
├── index.html                 # HTML entry point
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Root component
│   ├── App.css
│   ├── components/
│   │   ├── common/            # Header, Footer, Navigation
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── product/           # Componentes de produto
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── cart/              # Componentes de carrinho
│   │   │   ├── CartIcon.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── auth/              # Componentes autenticação
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── ui/                # Componentes base
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Card.tsx
│   ├── pages/                 # Page components
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Admin.tsx
│   ├── services/              # API calls
│   │   ├── api.ts             # Axios instance
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   ├── store/                 # Zustand state
│   │   ├── authStore.ts       # Estado autenticação
│   │   ├── cartStore.ts       # Estado carrinho
│   │   └── productStore.ts    # Estado produtos
│   ├── types/                 # TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── cart.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── utils/                 # Helper functions
│   │   ├── formatPrice.ts
│   │   ├── validation.ts
│   │   └── storage.ts
│   └── styles/                # CSS global
│       └── globals.css
├── tests/                     # Testes com Vitest
│   ├── components.test.tsx
│   └── hooks.test.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .eslintrc.cjs
```

## Fluxo de Dados - Exemplo: Comprar Produto

```
1. Usuário clica "Adicionar ao Carrinho"
        ↓
2. Frontend dispatch action em cartStore (Zustand)
        ↓
3. cartStore faz POST /api/cart/items via axios
        ↓
4. Backend recebe request no endpoint cart.py
        ↓
5. FastAPI middleware valida JWT token
        ↓
6. Rota chama cartService.add_item()
        ↓
7. Service valida dados com Pydantic schema
        ↓
8. Service faz query no banco (SQLAlchemy)
        ↓
9. Banco cria CartItem e retorna
        ↓
10. Response é serializado para JSON
        ↓
11. Frontend recebe e atualiza Zustand store
        ↓
12. Componentes rederizam com dados novos
```

## Segurança - Camadas

```
┌─────────────────────────────────────────┐
│  1. Frontend Validation (UX feedback)   │
│  - Validar inputs antes de enviar       │
│  - Mostrar erros ao usuário             │
└─────────────────────────────────────────┘
              ↓ HTTP Request
┌─────────────────────────────────────────┐
│  2. CORS Middleware (Protege backend)   │
│  - Bloqueia requisições de origem      │
│  - Whitelist de domínios permitidos    │
└─────────────────────────────────────────┘
              ↓ Validado
┌─────────────────────────────────────────┐
│  3. JWT Authentication                  │
│  - Valida token no header               │
│  - Verifica expiração e assinatura      │
│  - Extrai user_id do payload            │
└─────────────────────────────────────────┘
              ↓ Autenticado
┌─────────────────────────────────────────┐
│  4. Pydantic Schema Validation           │
│  - Valida tipos de dados                │
│  - Valida ranges (min, max)             │
│  - Valida formato (email, URL, etc)     │
└─────────────────────────────────────────┘
              ↓ Validado
┌─────────────────────────────────────────┐
│  5. Database Constraints                │
│  - Foreign keys                         │
│  - Unique constraints                   │
│  - Check constraints                    │
└─────────────────────────────────────────┘
              ↓ Safe
┌─────────────────────────────────────────┐
│  6. Business Logic Validation            │
│  - Verificar stock disponível           │
│  - Verificar permissões do usuário      │
│  - Verificar regras de negócio          │
└─────────────────────────────────────────┘
```

## Tecnologias & Justificativa

| Componente | Tech | Motivo |
|-----------|------|--------|
| **Backend HTTP** | FastAPI | Rápido, type hints, documentação automática |
| **ORM** | SQLAlchemy 2.0 | Poderoso, type-safe, suporta async |
| **Validação Backend** | Pydantic v2 | Type validation, serialização automática |
| **Autenticação** | JWT + bcrypt | Stateless, secure, industry standard |
| **Frontend Framework** | React 18 | Popular, componentes reutilizáveis, ecosistema |
| **Linguagem Frontend** | TypeScript | Type safety, IntelliSense, menos bugs |
| **Build Tool** | Vite | Rápido, ES modules, dev experience excelente |
| **Styling** | Tailwind CSS | Utility-first, design system consistente |
| **State Management** | Zustand | Leve, simples, sem boilerplate |
| **HTTP Client** | Axios | Simples, interceptadores, transformação |
| **Animações** | Framer Motion | Suave, declarativa, performance |
| **DB** | PostgreSQL | Robusto, JSON support, ACID transactions |
| **Containerização** | Docker | Reproducível, deploy fácil |

## Performance - Otimizações

### Backend
- Connection pooling (SQLAlchemy)
- Query optimization com indexes
- Async/await para I/O operations
- Caching com Redis (implementar)
- Pagination em lista de produtos

### Frontend
- Code splitting com lazy loading
- Image optimization
- Minificação em build
- Gzip compression
- Service worker para offline (PWA)
- Lighthouse score 90+

## Escalabilidade

### Horizontal (adicionar servidores)
- Stateless backend (sem sessões no servidor)
- JWT para autenticação distributed
- Database load balancing
- Redis cache distribuído

### Vertical (aumentar recursos)
- Connection pooling
- Query optimization
- Caching estratégico
- Índices de banco

## Monitoramento & Logging

```python
# Backend
import logging
logger = logging.getLogger(__name__)
logger.info(f"Produto criado: {product_id}")
logger.error(f"Erro ao processar pedido: {error}")

# Logs para arquivo ou serviço (Sentry, LogRocket)
```

```javascript
// Frontend
console.log('[API] GET /products -', response.status)
// Integrar com Sentry, Datadog, etc
```
