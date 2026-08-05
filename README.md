# 🛒 E-commerce Premium - FastAPI + React

Um projeto de e-commerce completo, moderno e profissional desenvolvido com **Python + FastAPI** no backend e **React + TypeScript** no frontend.

## 🚀 Features

- ✅ **Autenticação JWT** com registro, login, refresh token e **redefinição de senha por email**
- ✅ **Emails transacionais** (boas-vindas, confirmação de pedido, redefinir senha) via Resend
- ✅ **Catálogo de Produtos** com filtros, busca, paginação e **upload de imagem** (Cloudinary)
- ✅ **Carrinho de Compras** persistente
- ✅ **Checkout** com validação multi-step e 4 métodos de pagamento (Pix, cartão de crédito/débito simulados, e **Mercado Pago real via Checkout Pro + webhook**)
- ✅ **Wishlist** e **Avaliações** de produtos
- ✅ **Dashboard Admin** completo (produtos, categorias, pedidos, status)
- ✅ **Migrações de banco** com Alembic
- ✅ **Testes automatizados**: 17 testes de API (Pytest) + suíte E2E completa em navegador real (Playwright)
- ✅ **Responsivo** mobile-first
- ✅ **Design Premium** com Tailwind CSS
- ✅ **Type-Safe** com TypeScript e Python type hints

## 📋 Requisitos

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Git**

## 🔧 Setup Local

### 1. Clonar o repositório

\`\`\`bash
git clone https://github.com/matheusf8/e-commerce.git
cd sistema-de-E-commerce
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\\Scripts\\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Rodar migrações (quando implementar Alembic)
# alembic upgrade head

# Iniciar servidor
python main.py
\`\`\`

O backend estará disponível em: **http://localhost:8000**

Documentação Swagger: **http://localhost:8000/docs**

Rode `python seed_db.py` (dentro de `backend/`) para popular o banco com produtos de
exemplo e um usuário admin de teste: `admin@example.com` / `admin123`.

### 3. Setup Frontend

\`\`\`bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar dev server
npm run dev
\`\`\`

O frontend estará disponível em: **http://localhost:5173**

## 🗄️ Configuração do Banco de Dados

### Com Docker Compose (Recomendado)

\`\`\`bash
# Na raiz do projeto
docker-compose up -d

# Isso criará:
# - PostgreSQL rodando em localhost:5432
# - Database: ecommerce_db
# - User: ecommerce_user
# - Password: ecommerce_password
\`\`\`

### Manualmente

\`\`\`bash
# Criar banco de dados
createdb ecommerce_db

# Atualizar DATABASE_URL no .env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
projeto/
├── backend/
│   ├── app/
│   │   ├── api/           # Rotas/endpoints
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── schemas/       # Pydantic validation
│   │   ├── services/      # Lógica de negócio
│   │   ├── db/            # Conexão banco
│   │   ├── auth/          # JWT & segurança
│   │   └── middleware/    # CORS, errors
│   ├── tests/             # Testes Pytest
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Chamadas à API
│   │   ├── store/         # Zustand state
│   │   ├── types/         # TypeScript types
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Helpers
│   │   ├── styles/        # Tailwind CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── e2e/                # Testes E2E (Playwright)
│   ├── tests/
│   ├── package.json
│   ├── playwright.config.ts
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
├── docs/
│   ├── API.md                        # Documentação da API
│   ├── SETUP.md                      # Setup detalhado
│   ├── ARCHITECTURE.md               # Arquitetura
│   └── PAGAMENTO_MERCADO_PAGO.md      # Como configurar o Mercado Pago (sandbox)
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
\`\`\`

## 🎨 Design System

### Paleta de Cores
- **Primary:** #3B82F6 (Azul vibrante)
- **Secondary:** #10B981 (Verde sucesso)
- **Accent:** #F59E0B (Laranja destaque)
- **Dark:** #1F2937 (Cinza escuro)
- **Light:** #F9FAFB (Branco gelo)

### Stack de Styling
- **Tailwind CSS** para utility-first styling
- **Framer Motion** para animações suaves
- **Lucide React** para ícones

## 🔐 Segurança

- ✅ JWT para autenticação
- ✅ CORS configurado
- ✅ Validação de inputs com Pydantic
- ✅ Proteção contra XSS e CSRF
- ✅ Senhas com hash (bcrypt)
- ✅ Rate limiting (implementar)

## 🧪 Testes

### Backend (Pytest)
\`\`\`bash
cd backend
pytest tests/ -v --cov
\`\`\`

### Frontend — unitário (Vitest)
\`\`\`bash
cd frontend
npm test
\`\`\`

### Frontend — E2E em navegador real (Playwright)
Com o backend (`python main.py`) e o frontend (`npm run dev`) já rodando:
\`\`\`bash
cd frontend
npm run test:e2e       # roda a suíte completa (jornada cliente + admin) num Chromium real
npm run test:e2e:ui     # mesma suíte, com interface interativa
\`\`\`

## 📊 Scripts Úteis

### Backend
\`\`\`bash
# Rodar servidor
python main.py

# Rodar com reload
uvicorn main:app --reload

# Popular banco com dados de teste + usuário admin (admin@example.com / admin123)
python seed_db.py
\`\`\`

### Frontend
\`\`\`bash
# Dev server
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## 🚀 Deploy

Backend (Render, via `render.yaml` na raiz) + frontend (Vercel, via
`frontend/vercel.json`) + domínio próprio + Mercado Pago/Cloudinary/Resend em
modo produção — checklist completo e na ordem certa em
[docs/DEPLOY.md](./docs/DEPLOY.md).

## 📚 Documentação Detalhada

- [API Documentation](./docs/API.md)
- [Setup Avançado](./docs/SETUP.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Pagamento com Mercado Pago (sandbox)](./docs/PAGAMENTO_MERCADO_PAGO.md)
- [Deploy de produção](./docs/DEPLOY.md)

## 🤝 Contributing

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Matheus Franco - [@matheusf8](https://github.com/matheusf8)

## 📞 Contato

- Email: matheuslobofranco@gmail.com
- GitHub: [@matheusf8](https://github.com/matheusf8)

## 🙏 Agradecimentos

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pydantic](https://docs.pydantic.dev/)

---

**Made with ❤️ for the web development community**
