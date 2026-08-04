"""
Testes de integração da API
Testa o fluxo completo: registro → login → adicionar ao carrinho → checkout → ver pedido
"""
import pytest
from fastapi.testclient import TestClient
import uuid


def test_health_check(client: TestClient):
    """Testa se a API está rodando"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_products(client: TestClient):
    """Testa listagem de produtos"""
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0


def test_get_featured_products(client: TestClient):
    """Testa produtos em destaque"""
    response = client.get("/api/products/featured")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)


def test_get_product_detail(client: TestClient):
    """Testa detalhe de um produto"""
    # Primeiro pega um produto da lista
    res = client.get("/api/products")
    products = res.json()["items"]
    if products:
        product_id = products[0]["id"]
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        assert "name" in data
        assert "price" in data


def test_categories(client: TestClient):
    """Testa listagem de categorias"""
    response = client.get("/api/products/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0


@pytest.fixture(scope="module")
def auth_headers(client: TestClient):
    """Fixture para registrar, logar e retornar headers de autenticação."""
    email = f"testuser_{uuid.uuid4()}@example.com"
    password = "password123"

    # Registrar
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })

    # Logar
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, email


def test_register_and_login(auth_headers, client: TestClient):
    """Testa se a fixture de autenticação funciona e o perfil é acessível."""
    headers, email = auth_headers
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email


def test_full_cart_and_order_flow(auth_headers, client: TestClient):
    """Testa o fluxo completo: adicionar ao carrinho, ver carrinho, criar pedido."""
    headers, _ = auth_headers

    # 1. Pega um produto para adicionar ao carrinho
    res = client.get("/api/products")
    products = res.json()["items"]
    assert len(products) > 0, "Precisa de produtos no banco para o teste"
    product = products[0]

    # 2. Adiciona ao carrinho
    add_res = client.post("/api/cart/items",
        json={"product_id": product["id"], "quantity": 2},
        headers=headers
    )
    assert add_res.status_code == 201
    cart_data = add_res.json()
    assert cart_data["item_count"] == 2
    assert cart_data["items"][0]["product_id"] == product["id"]

    # 3. Verifica o carrinho
    get_cart_res = client.get("/api/cart", headers=headers)
    assert get_cart_res.status_code == 200
    cart_data = get_cart_res.json()
    assert "items" in cart_data and "total" in cart_data and "item_count" in cart_data
    assert cart_data["items"][0]["product_name"] == product["name"]

    # 4. Cria o pedido
    order_res = client.post("/api/orders", json={
        "shipping_address": "Rua Teste, 123",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01001000",
        "payment_method": "credit_card"
    }, headers=headers)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["status"] in ["pending", "processing"]
    assert len(order_data["items"]) > 0

    # 5. Verifica se o carrinho foi limpo
    cart_after_order_res = client.get("/api/cart", headers=headers)
    assert cart_after_order_res.json()["item_count"] == 0

    # 6. Verifica se o pedido aparece na lista de "meus pedidos"
    my_orders_res = client.get("/api/orders/my-orders", headers=headers)
    assert my_orders_res.status_code == 200
    my_orders_data = my_orders_res.json()
    assert len(my_orders_data["items"]) > 0
    assert my_orders_data["items"][0]["id"] == order_data["id"]


def test_auth_required_for_protected_routes(client: TestClient):
    """Testa que endpoints protegidos retornam 401 sem token."""
    # Carrinho
    assert client.get("/api/cart").status_code == 401
    assert client.post("/api/cart/items", json={
        "product_id": "1", "quantity": 1
    }).status_code == 401

    # Pedidos
    assert client.get("/api/orders/my-orders").status_code == 401
    assert client.post("/api/orders", json={}).status_code == 401

    # Perfil
    assert client.get("/api/auth/me").status_code == 401


def test_register_duplicate_email(client: TestClient):
    """Testa registro com email duplicado"""
    email = f"dup_{uuid.uuid4()}@example.com"
    # Primeiro registro
    res1 = client.post("/api/auth/register", json={
        "email": email,
        "password": "password123",
        "full_name": "Test User"
    })
    assert res1.status_code == 201

    # Segundo registro com mesmo email
    res2 = client.post("/api/auth/register", json={
        "email": email,
        "password": "password456",
        "full_name": "Test User 2"
    })
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_wishlist_flow(client: TestClient):
    """Testa fluxo completo da wishlist"""
    # Registrar e logar
    email = f"wish_{uuid.uuid4()}@example.com"
    client.post("/api/auth/register", json={
        "email": email, "password": "password123", "full_name": "Wish User"
    })
    login_res = client.post("/api/auth/login", json={
        "email": email, "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Pegar um produto
    res = client.get("/api/products")
    products = res.json()["items"]
    assert len(products) > 0
    product_id = products[0]["id"]

    # Adicionar à wishlist
    add_res = client.post(f"/api/wishlist/{product_id}", headers=headers)
    assert add_res.status_code == 201

    # Verificar wishlist
    get_res = client.get("/api/wishlist", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["count"] >= 1

    # Verificar se o produto está na wishlist
    check_res = client.get(f"/api/wishlist/check/{product_id}", headers=headers)
    assert check_res.status_code == 200
    assert check_res.json()["in_wishlist"] is True

    # Tentar adicionar novamente (deve falhar)
    dup_res = client.post(f"/api/wishlist/{product_id}", headers=headers)
    assert dup_res.status_code == 400
    assert "already in wishlist" in dup_res.json()["detail"].lower()

    # Remover da wishlist
    item_id = data["items"][0]["id"]
    del_res = client.delete(f"/api/wishlist/{item_id}", headers=headers)
    assert del_res.status_code == 204


def test_review_flow(client: TestClient):
    """Testa fluxo de criação de review"""
    # Registrar e logar
    email = f"rev_{uuid.uuid4()}@example.com"
    client.post("/api/auth/register", json={
        "email": email, "password": "password123", "full_name": "Review User"
    })
    login_res = client.post("/api/auth/login", json={
        "email": email, "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Pegar um produto
    res = client.get("/api/products")
    products = res.json()["items"]
    assert len(products) > 0
    product_id = products[0]["id"]

    # Criar review
    review_res = client.post(f"/api/reviews/{product_id}", json={
        "rating": 5,
        "title": "Excelente produto!",
        "comment": "Muito bom, recomendo."
    }, headers=headers)
    assert review_res.status_code == 201
    review_data = review_res.json()
    assert review_data["rating"] == 5
    assert review_data["title"] == "Excelente produto!"

    # Tentar criar review duplicada
    dup_res = client.post(f"/api/reviews/{product_id}", json={
        "rating": 3,
        "title": "Outra review",
        "comment": "Teste"
    }, headers=headers)
    assert dup_res.status_code == 400
    assert "already reviewed" in dup_res.json()["detail"].lower()

    # Buscar reviews do produto
    get_res = client.get(f"/api/reviews/{product_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["total"] >= 1


def test_checkout_insufficient_stock(client: TestClient):
    """Testa checkout com quantidade maior que o estoque"""
    # Registrar e logar
    email = f"stock_{uuid.uuid4()}@example.com"
    client.post("/api/auth/register", json={
        "email": email, "password": "password123", "full_name": "Stock User"
    })
    login_res = client.post("/api/auth/login", json={
        "email": email, "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Pegar um produto e adicionar mais que o estoque
    res = client.get("/api/products")
    products = res.json()["items"]
    assert len(products) > 0

    # Encontrar produto com estoque baixo ou usar quantidade que excede o estoque
    product = products[0]
    product_stock = product.get("stock", 10)
    huge_qty = product_stock + 1 if product_stock else 9999  # Excede o estoque mas é válido no schema (<= 9999)

    add_res = client.post("/api/cart/items", json={
        "product_id": product["id"], "quantity": huge_qty
    }, headers=headers)
    assert add_res.status_code == 400
    assert "stock" in add_res.json()["detail"].lower()


def test_list_categories(client: TestClient):
    """Testa listagem de categorias via endpoint específico"""
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

