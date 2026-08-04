"""
Instrução de Execução do E-commerce

## 1️⃣ SETUP INICIAL

### Backend Setup:
```bash
# Entre no diretório backend
cd backend

# Copie o arquivo de ambiente
cp .env.example .env

# Crie um virtual environment (opcional mas recomendado)
python -m venv venv
venv\\Scripts\\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instale as dependências
pip install -r requirements.txt

# Execute o seed do banco de dados
python seed_db.py

# Inicie o servidor
python main.py
# O servidor estará em http://localhost:8000
# Docs em http://localhost:8000/docs
```

### Frontend Setup:
```bash
# Entre no diretório frontend
cd frontend

# Instale as dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
# A aplicação estará em http://localhost:5173
```

## 2️⃣ EXECUÇÃO COM DOCKER (Recomendado para Produção)

```bash
# Na raiz do projeto, execute:
docker-compose up -d

# O backend estará em http://localhost:8000
# O frontend estará em http://localhost:3000
# O PostgreSQL estará em localhost:5432
```

## 3️⃣ CREDENCIAIS DE TESTE

### Admin:
- Email: admin@example.com
- Senha: admin123

### Usuário Regular (registre no frontend)

## 4️⃣ ENDPOINTS PRINCIPAIS

### Autenticação
- POST /api/auth/register - Registrar novo usuário
- POST /api/auth/login - Fazer login
- POST /api/auth/refresh - Renovar token
- GET /api/auth/me - Obter perfil atual

### Produtos
- GET /api/products - Listar todos os produtos
- GET /api/products/{id} - Obter produto
- GET /api/products/featured - Produtos em destaque
- GET /api/products/search - Buscar produtos
- POST /api/products - Criar produto (admin)
- PUT /api/products/{id} - Atualizar produto (admin)
- DELETE /api/products/{id} - Deletar produto (admin)

### Carrinho
- GET /api/cart - Obter carrinho
- POST /api/cart/items - Adicionar item
- PUT /api/cart/items/{id} - Atualizar item
- DELETE /api/cart/items/{id} - Remover item

### Pedidos
- POST /api/orders - Criar pedido
- GET /api/orders/my-orders - Meus pedidos
- GET /api/orders/{id} - Obter pedido

### Avaliações
- GET /api/reviews/{product_id} - Obter avaliações do produto
- POST /api/reviews/{product_id} - Criar avaliação
- PUT /api/reviews/{id} - Atualizar avaliação
- DELETE /api/reviews/{id} - Deletar avaliação

## 5️⃣ FEATURES IMPLEMENTADAS

✅ Autenticação com JWT
✅ Carrinho de compras
✅ Checkout com múltiplas etapas
✅ Sistema de pedidos
✅ Avaliações de produtos
✅ Admin dashboard
✅ Filtros e busca de produtos
✅ Gestão de usuários
✅ Segurança com bcrypt
✅ CORS configurado

## 6️⃣ ESTRUTURA DO PROJETO

```
sistema-de-E-commerce/
├── backend/
│   ├── app/
│   │   ├── models/      # Modelos ORM
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Lógica de negócio
│   │   ├── api/         # Endpoints
│   │   ├── auth/        # Autenticação
│   │   ├── db/          # Database config
│   │   └── middleware/  # Middlewares
│   ├── main.py          # Aplicação principal
│   ├── seed_db.py       # Seed de dados
│   └── requirements.txt  # Dependências
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API calls
│   │   ├── store/       # Zustand stores
│   │   ├── types/       # TypeScript types
│   │   ├── App.tsx      # App principal
│   │   └── main.tsx     # Entry point
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

## 7️⃣ PRÓXIMAS FEATURES PARA ADICIONAR

- [ ] Email notifications
- [ ] Rate limiting avançado
- [ ] Wishlist completa
- [ ] Recomendações de produtos
- [ ] Pagamento com Stripe
- [ ] Sistema de cupons
- [ ] Tracking de pedidos em tempo real
- [ ] Analytics dashboard
- [ ] Testes automatizados

## 8️⃣ TROUBLESHOOTING

### Erro de conexão com banco de dados:
```bash
# Certifique-se de que o PostgreSQL está rodando
# E que a DATABASE_URL em .env está correta
```

### CORS errors:
```bash
# Verifique se ALLOWED_ORIGINS em .env inclui sua URL do frontend
```

### Port 8000 já em uso:
```bash
# Mude a porta em main.py ou use:
python main.py --port 8001
```

## 9️⃣ SUPORTE E CONTRIBUIÇÃO

Para dúvidas ou contribuições, crie uma issue ou PR no repositório.
"""
