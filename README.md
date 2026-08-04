# 🛒 E-commerce Premium - FastAPI + React

Um projeto de e-commerce completo, moderno e profissional desenvolvido com **Python + FastAPI** no backend e **React + TypeScript** no frontend.

## 🚀 Features

- ✅ **Autenticação JWT** com registro, login e refresh token
- ✅ **Catálogo de Produtos** com filtros, busca e paginação
- ✅ **Carrinho de Compras** persistente
- ✅ **Checkout** com validação multi-step
- ✅ **Dashboard Admin** para gerenciar produtos
- ✅ **Sistema de Avaliações** de produtos
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
│   ├── tests/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
├── docs/
│   ├── API.md             # Documentação da API
│   ├── SETUP.md           # Setup detalhado
│   └── ARCHITECTURE.md    # Arquitetura
├── docker-compose.yml
├── .env.example
├── .gitignore
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

### Backend
\`\`\`bash
cd backend
pytest tests/ -v --cov
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm test
\`\`\`

## 📊 Scripts Úteis

### Backend
\`\`\`bash
# Rodar servidor
python main.py

# Rodar com reload
uvicorn main:app --reload

# Criar usuário admin
python scripts/create_admin.py

# Popular banco com dados de teste
python scripts/seed_db.py
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

### Backend (Render.com)
\`\`\`bash
# Criar account no Render
# Conectar repositório GitHub
# Criar novo Web Service
# Settings:
# - Build Command: pip install -r requirements.txt
# - Start Command: uvicorn main:app --host 0.0.0.0
\`\`\`

### Frontend (Vercel)
\`\`\`bash
# Criar account no Vercel
# Conectar repositório GitHub
# Vercel detecta automaticamente Vite
# Deploy automático em cada push
\`\`\`

## 📚 Documentação Detalhada

- [API Documentation](./docs/API.md)
- [Setup Avançado](./docs/SETUP.md)
- [Arquitetura](./docs/ARCHITECTURE.md)

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
