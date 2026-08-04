# 📚 API Documentation

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** (será configurado no deploy)

## Autenticação

Todos os endpoints protegidos requerem um JWT token no header:

\`\`\`bash
Authorization: Bearer <seu_token_jwt>
\`\`\`

## Endpoints

### 1. Health Check

#### GET /health

Verifica se o servidor está rodando.

**Response:**
\`\`\`json
{
  "status": "ok",
  "message": "E-commerce API is running"
}
\`\`\`

---

### 2. Autenticação

#### POST /api/auth/register

Registra um novo usuário.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "João Silva"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "João Silva",
  "is_active": true,
  "created_at": "2024-01-20T10:30:00Z"
}
\`\`\`

---

#### POST /api/auth/login

Faz login e retorna tokens.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
\`\`\`

---

#### POST /api/auth/refresh

Renova o access token usando o refresh token.

**Request Body:**
\`\`\`json
{
  "refresh_token": "seu_refresh_token_aqui"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "access_token": "novo_access_token",
  "token_type": "bearer"
}
\`\`\`

---

### 3. Produtos

#### GET /api/products

Lista todos os produtos com filtros opcionais.

**Query Parameters:**
- `skip` (int): Número de registros a pular (padrão: 0)
- `limit` (int): Número máximo de registros (padrão: 10)
- `category` (str): Filtrar por categoria
- `min_price` (float): Preço mínimo
- `max_price` (float): Preço máximo
- `search` (str): Buscar por nome ou descrição

**Response (200):**
\`\`\`json
{
  "items": [
    {
      "id": "uuid",
      "name": "Produto 1",
      "description": "Descrição do produto",
      "price": 99.99,
      "category": "Eletrônicos",
      "stock": 50,
      "rating": 4.5,
      "image_url": "https://...",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}
\`\`\`

---

#### GET /api/products/{product_id}

Obtém detalhes de um produto específico.

**Response (200):**
\`\`\`json
{
  "id": "uuid",
  "name": "Produto",
  "description": "Descrição detalhada",
  "price": 99.99,
  "category": "Eletrônicos",
  "stock": 50,
  "rating": 4.5,
  "reviews": [
    {
      "id": "uuid",
      "user_name": "João",
      "rating": 5,
      "comment": "Produto excelente!",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "related_products": [...]
}
\`\`\`

---

#### POST /api/products (Admin)

Cria um novo produto (requer admin).

**Request Body:**
\`\`\`json
{
  "name": "Novo Produto",
  "description": "Descrição",
  "price": 99.99,
  "category": "Eletrônicos",
  "stock": 50,
  "image_url": "https://..."
}
\`\`\`

**Response (201):**
Retorna o produto criado

---

### 4. Carrinho

#### GET /api/cart

Obtém o carrinho do usuário autenticado.

**Response (200):**
\`\`\`json
{
  "id": "uuid",
  "user_id": "uuid",
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "Produto",
      "price": 99.99,
      "quantity": 2,
      "subtotal": 199.98
    }
  ],
  "total": 199.98,
  "item_count": 2
}
\`\`\`

---

#### POST /api/cart/items

Adiciona item ao carrinho.

**Request Body:**
\`\`\`json
{
  "product_id": "uuid",
  "quantity": 2
}
\`\`\`

**Response (201):**
Retorna o carrinho atualizado

---

#### PUT /api/cart/items/{item_id}

Atualiza quantidade de um item.

**Request Body:**
\`\`\`json
{
  "quantity": 5
}
\`\`\`

---

#### DELETE /api/cart/items/{item_id}

Remove um item do carrinho.

**Response (204):** No content

---

### 5. Pedidos

#### POST /api/orders

Cria um novo pedido (checkout).

**Request Body:**
\`\`\`json
{
  "shipping_address": "Rua X, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01234-567",
  "payment_method": "credit_card"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "total": 199.98,
  "items": [...],
  "shipping_address": "Rua X, 123",
  "created_at": "2024-01-20T10:00:00Z"
}
\`\`\`

---

#### GET /api/orders

Lista pedidos do usuário autenticado.

**Response (200):**
\`\`\`json
{
  "items": [
    {
      "id": "uuid",
      "status": "delivered",
      "total": 199.98,
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
\`\`\`

---

#### GET /api/orders/{order_id}

Obtém detalhes de um pedido.

**Response (200):**
Retorna pedido completo com todos os itens

---

## Status Codes

- **200:** OK - Requisição bem-sucedida
- **201:** Created - Recurso criado com sucesso
- **204:** No Content - Operação bem-sucedida, sem conteúdo
- **400:** Bad Request - Erro na requisição (validação)
- **401:** Unauthorized - Token ausente ou inválido
- **403:** Forbidden - Sem permissão
- **404:** Not Found - Recurso não encontrado
- **500:** Internal Server Error - Erro no servidor

## Erros

Todas as respostas de erro seguem este formato:

\`\`\`json
{
  "detail": "Mensagem de erro descritiva",
  "status_code": 400,
  "timestamp": "2024-01-20T10:30:00Z"
}
\`\`\`

## Rate Limiting

- **Limite:** 100 requisições por minuto por IP
- **Header de resposta:** \`X-RateLimit-Remaining\`

## Swagger UI

Documentação interativa disponível em: \`http://localhost:8000/docs\`
