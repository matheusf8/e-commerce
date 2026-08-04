import pytest
from fastapi.testclient import TestClient
from main import app
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User, Product, WishlistItem
from app.services import UserService


client = TestClient(app)

@pytest.fixture(scope="module")
def test_user_and_token():
    """Cria um usuário de teste e retorna o usuário e o token."""
    email = "wishlist.user@test.com"
    password = "password123"
    
    # Garante que o usuário não existe de execuções anteriores
    db: Session = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.query(WishlistItem).filter(WishlistItem.user_id == user.id).delete()
        db.delete(user)
        db.commit()

    # Registra um novo usuário
    register_res = client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Wishlist User"})
    assert register_res.status_code == 201
    
    # Faz login para obter o token
    login_res = client.post("/api/auth/login", json={"email": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    user = UserService.get_user_by_email(db, email)
    return user, headers

@pytest.fixture(scope="module")
def test_product():
    """Pega um produto existente para usar nos testes."""
    res = client.get("/api/products")
    products = res.json()["items"]
    assert len(products) > 0, "O banco de dados precisa de produtos para os testes de wishlist."
    return products[0]

@pytest.fixture(autouse=True)
def clean_wishlist_before_each(test_user_and_token):
    """Garante que a wishlist esteja vazia antes de cada teste."""
    user, _ = test_user_and_token
    db: Session = next(get_db())
    db.query(WishlistItem).filter(WishlistItem.user_id == user.id).delete()
    db.commit()

def test_get_wishlist_empty(test_user_and_token):
    """Testa obter uma wishlist vazia."""
    _, headers = test_user_and_token
    response = client.get("/api/wishlist", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["count"] == 0

def test_add_and_remove_item_from_wishlist(test_user_and_token, test_product):
    """Testa adicionar um item à wishlist."""
    _, headers = test_user_and_token
    product_id = test_product["id"]

    # 1. Adiciona o item
    response = client.post(f"/api/wishlist/items", json={"product_id": product_id}, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["count"] == 1
    assert data["items"][0]["product_id"] == product_id
    assert data["items"][0]["product_name"] == test_product["name"]
    
    # 2. Verifica se o item está lá
    get_response = client.get("/api/wishlist", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["count"] == 1

    # 3. Remove o item
    delete_response = client.delete(f"/api/wishlist/items/{product_id}", headers=headers)
    assert delete_response.status_code == 204

    # 4. Verifica se a wishlist está vazia agora
    get_response_after_delete = client.get("/api/wishlist", headers=headers)
    assert get_response_after_delete.status_code == 200
    assert get_response_after_delete.json()["count"] == 0

def test_add_duplicate_item_to_wishlist(test_user_and_token, test_product):
    """Testa que adicionar um item duplicado não causa erro e não duplica o item."""
    _, headers = test_user_and_token
    product_id = test_product["id"]
    
    # Adiciona o item uma vez
    response1 = client.post(f"/api/wishlist/items", json={"product_id": product_id}, headers=headers)
    assert response1.status_code == 201
    assert response1.json()["count"] == 1
    
    # Tenta adicionar o mesmo item de novo
    response2 = client.post(f"/api/wishlist/items", json={"product_id": product_id}, headers=headers)
    assert response2.status_code == 201 # Corrigido de 200 para 201
    assert response2.json()["count"] == 1 # A contagem não deve aumentar