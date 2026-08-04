# 🔧 Setup Avançado

## Configuração de Ambiente

### Variáveis de Ambiente Importantes

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# JWT Secret (mude em produção!)
SECRET_KEY=your-super-secret-key-change-in-production

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (para notificações)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app

# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
\`\`\`

## Banco de Dados

### Com PostgreSQL Local

\`\`\`bash
# Windows (via WSL ou Git Bash)
createdb -U postgres ecommerce_db

# macOS
createdb ecommerce_db

# Linux
sudo -u postgres createdb ecommerce_db
\`\`\`

### Migrations com Alembic (quando implementar)

\`\`\`bash
cd backend

# Gerar migration automática
alembic revision --autogenerate -m "Initial schema"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1
\`\`\`

## Backend - Configuração Detalhada

### Instalação

\`\`\`bash
cd backend

# Criar virtual env
python -m venv venv

# Ativar (Windows)
venv\\Scripts\\activate

# Ativar (macOS/Linux)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar env
cp .env.example .env
\`\`\`

### Executar

\`\`\`bash
# Dev mode com reload
python main.py

# Ou com Uvicorn diretamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Produção (sem reload)
uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

### Debug

\`\`\`bash
# Com print debugging
python -u main.py

# Com debugger Python
python -m pdb main.py

# Com debugger VSCode (launch.json configurado)
# Basta apertar F5
\`\`\`

## Frontend - Configuração Detalhada

### Instalação

\`\`\`bash
cd frontend

# Instalar dependências
npm install

# Copiar env
cp .env.example .env
\`\`\`

### Desenvolvimento

\`\`\`bash
# Dev server com HMR
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## Docker Setup

### Build das imagens

\`\`\`bash
# Todas as imagens
docker-compose build

# Apenas backend
docker-compose build backend

# Apenas frontend
docker-compose build frontend
\`\`\`

### Rodar containers

\`\`\`bash
# Tudo junto
docker-compose up

# Em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Remover volumes (⚠️ deleta dados!)
docker-compose down -v
\`\`\`

### Acessar containers

\`\`\`bash
# Terminal no backend
docker-compose exec backend bash

# Terminal no PostgreSQL
docker-compose exec db psql -U ecommerce_user -d ecommerce_db

# Ver processo no backend
docker-compose exec backend ps aux
\`\`\`

## Testes

### Backend com Pytest

\`\`\`bash
cd backend

# Rodar todos os testes
pytest

# Rodar com cobertura
pytest --cov=app tests/

# Rodar teste específico
pytest tests/test_auth.py::test_login

# Verbose
pytest -v

# Com output
pytest -s
\`\`\`

### Frontend com Vitest

\`\`\`bash
cd frontend

# Rodar testes
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
\`\`\`

## Performance & Otimização

### Backend

\`\`\`python
# Usar connection pooling
SQLALCHEMY_POOL_SIZE = 20
SQLALCHEMY_MAX_OVERFLOW = 0

# Cache com Redis (quando implementar)
# Instalar: pip install redis
# Usar para cachear queries de produtos

# Async queries
async def get_products():
    async with SessionLocal() as session:
        return await session.execute(...)
\`\`\`

### Frontend

\`\`\`bash
# Lazy loading de componentes
import { lazy, Suspense } from 'react'

const ProductDetail = lazy(() => import('./pages/ProductDetail'))

# Code splitting automático no Vite
# Configurado no vite.config.ts

# Lighthouse score
# https://lighthouse-lab.appspot.com/
\`\`\`

## Debugging

### Backend - VSCode

Criar `.vscode/launch.json`:

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "jinja": true,
      "cwd": "\${workspaceFolder}/backend"
    }
  ]
}
\`\`\`

### Frontend - VSCode

Extensão recomendada: **Debugger for Chrome**

### Logs

\`\`\`python
# Backend
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Debug message")
\`\`\`

\`\`\`javascript
// Frontend
console.log('Debug:', data)
console.error('Error:', error)
\`\`\`

## CI/CD - GitHub Actions

Criar `.github/workflows/tests.yml`:

\`\`\`yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend deps
        run: |
          cd frontend
          npm install
      
      - name: Build frontend
        run: |
          cd frontend
          npm run build
\`\`\`

## Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"

\`\`\`bash
# Certifique que o venv está ativado
source venv/bin/activate  # macOS/Linux
venv\\Scripts\\activate     # Windows

# Reinstale
pip install -r requirements.txt
\`\`\`

### "Cannot GET /api/..."

Backend provavelmente não está rodando. Verifique porta 8000:

\`\`\`bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
\`\`\`

### CORS Error

Verifique `ALLOWED_ORIGINS` no `.env`:

\`\`\`env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
\`\`\`

### Database Connection Error

\`\`\`bash
# Testar conexão
psql postgresql://user:password@localhost:5432/ecommerce_db
\`\`\`
