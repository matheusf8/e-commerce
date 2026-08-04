"""
Testes de integração para o fluxo de pagamento e checkout
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
import uuid

# A fixture 'client' é importada automaticamente de conftest.py

@pytest.fixture(scope="module")
def auth_headers(client: TestClient):
    """Fixture para registrar, logar e retornar headers de autenticação para os testes do módulo."""
    email = f"testuser_payment_{uuid.uuid4()}@example.com"
    password = "password123"
    
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Payment Test User"})
    
    login_res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200, "Falha ao fazer login para obter token de teste."
    token = login_res.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}

def get_a_product_id(client: TestClient):
    """Helper para obter um ID de produto válido do banco de dados."""
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()["items"]
    assert len(products) > 0, "O banco de dados precisa ter produtos para os testes de pagamento."
    return products[0]["id"]

@patch('app.services.order_service.random.random', return_value=0.1) # Garante sucesso (< 0.8)
def test_checkout_credit_card_success(mock_random, auth_headers, client: TestClient):
    """
    Testa o fluxo de checkout com cartão de crédito com pagamento APROVADO.
    """
    product_id = get_a_product_id(client)
    add_res = client.post("/api/cart/items", json={"product_id": product_id, "quantity": 1}, headers=auth_headers)
    assert add_res.status_code == 201

    order_payload = {
        "shipping_address": "Rua do Sucesso, 123",
        "city": "Testelandia",
        "state": "TS",
        "zip_code": "12345-678",
        "payment_method": "credit_card",
        "card_number": "1234123412341234",
        "card_name": "Test User Success",
        "card_expiry": "12/28",
        "card_cvv": "123"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=auth_headers)
    
    assert order_res.status_code == 201
    order_data = order_res.json()

    assert order_data["payment_approved"] is True
    assert order_data["payment_status"] == "completed"
    assert order_data["status"] == "processing"
    assert "Pagamento aprovado!" in order_data["payment_message"]

    cart_res = client.get("/api/cart", headers=auth_headers)
    assert cart_res.status_code == 200
    assert cart_res.json()["item_count"] == 0

@patch('app.services.order_service.random.random', return_value=0.9) # Garante falha (> 0.8)
def test_checkout_credit_card_failure(mock_random, auth_headers, client: TestClient):
    """
    Testa o fluxo de checkout com cartão de crédito com pagamento RECUSADO.
    """
    product_id = get_a_product_id(client)
    add_res = client.post("/api/cart/items", json={"product_id": product_id, "quantity": 1}, headers=auth_headers)
    assert add_res.status_code == 201

    order_payload = {
        "shipping_address": "Rua da Falha, 456",
        "city": "Erroville",
        "state": "ER",
        "zip_code": "54321-876",
        "payment_method": "credit_card",
        "card_number": "9876987698769876",
        "card_name": "Test User Failure",
        "card_expiry": "10/25",
        "card_cvv": "321"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=auth_headers)
    
    assert order_res.status_code == 201
    order_data = order_res.json()

    assert order_data["payment_approved"] is False
    assert order_data["payment_status"] == "failed"
    assert order_data["status"] == "pending"
    assert "Pagamento recusado" in order_data["payment_message"]
    
    cart_res = client.get("/api/cart", headers=auth_headers)
    assert cart_res.status_code == 200
    assert cart_res.json()["item_count"] == 0

def test_checkout_pix_success(auth_headers, client: TestClient):
    """
    Testa o fluxo de checkout com PIX, que deve ser sempre APROVADO.
    """
    product_id = get_a_product_id(client)
    add_res = client.post("/api/cart/items", json={"product_id": product_id, "quantity": 1}, headers=auth_headers)
    assert add_res.status_code == 201

    order_payload = {
        "shipping_address": "Avenida Pix, 789",
        "city": "Pagamento Instantaneo",
        "state": "PI",
        "zip_code": "78901-234",
        "payment_method": "pix"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=auth_headers)
    
    assert order_res.status_code == 201
    order_data = order_res.json()

    assert order_data["payment_approved"] is True
    assert order_data["payment_status"] == "completed"
    assert order_data["status"] == "processing"
    assert "Pagamento PIX aprovado" in order_data["payment_message"]

def test_checkout_empty_cart(auth_headers, client: TestClient):
    """
    Testa a tentativa de checkout com o carrinho vazio.
    """
    client.delete("/api/cart", headers=auth_headers)

    order_payload = {
        "shipping_address": "Rua Inexistente, 0",
        "city": "Vazio",
        "state": "VZ",
        "zip_code": "00000-000",
        "payment_method": "pix"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=auth_headers)

    assert order_res.status_code == 400
    assert order_res.json()["detail"] == "Cart is empty"

