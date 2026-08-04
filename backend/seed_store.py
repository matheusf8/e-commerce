"""Seed script to populate the database with sample data"""
import requests
import sqlite3
import os

BASE_URL = "http://localhost:8000"
DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce.db")

def main():
    # 1. Register admin
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": "admin@loja.com",
        "password": "admin1234",
        "full_name": "Admin"
    })
    print(f"[REGISTER ADMIN] Status: {r.status_code}")
    
    # 2. Make user admin directly in DB
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE users SET is_admin=1 WHERE email=?", ("admin@loja.com",))
    conn.commit()
    conn.close()
    print("[DB] User promoted to admin")
    
    # 3. Login as admin
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@loja.com",
        "password": "admin1234"
    })
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[LOGIN ADMIN] Status: {r.status_code}")
    
    # 4. Create categories
    categories = [
        {"name": "Eletrônicos", "description": "Produtos eletrônicos em geral"},
        {"name": "Roupas", "description": "Moda e vestuário"},
        {"name": "Livros", "description": "Livros e publicações"},
        {"name": "Casa", "description": "Produtos para casa"},
        {"name": "Esportes", "description": "Artigos esportivos"},
        {"name": "Beleza", "description": "Produtos de beleza e cuidados"},
    ]
    for cat in categories:
        r = requests.post(f"{BASE_URL}/api/categories", json=cat, headers=headers)
        print(f"[CATEGORY] {cat['name']}: {r.status_code}")
    
    # 5. Create products
    products = [
        {
            "name": "Notebook Gamer Pro",
            "description": "Notebook de alta performance para jogos com placa RTX 4060, 16GB RAM, SSD 512GB",
            "price": 5999.99,
            "original_price": 6999.99,
            "category": "Eletrônicos",
            "brand": "TechPro",
            "stock": 10,
            "sku": "NB-GAMER-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/3B82F6/white?text=Notebook+Gamer",
            "images_urls": '["https://placehold.co/600x400/3B82F6/white?text=Notebook"]'
        },
        {
            "name": "Smartphone Ultra 5G",
            "description": "Smartphone top de linha com câmera de 108MP, 256GB, 5G",
            "price": 2999.99,
            "original_price": 3499.99,
            "category": "Eletrônicos",
            "brand": "MobileX",
            "stock": 20,
            "sku": "SP-ULTRA-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/10B981/white?text=Smartphone",
            "images_urls": '["https://placehold.co/600x400/10B981/white?text=Smartphone"]'
        },
        {
            "name": "Camiseta Esportiva Dry-Fit",
            "description": "Camiseta dry-fit para atividades físicas, tecido respirável",
            "price": 89.99,
            "category": "Roupas",
            "brand": "SportWear",
            "stock": 50,
            "sku": "CAM-ESPORTE-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/F59E0B/white?text=Camiseta",
            "images_urls": '["https://placehold.co/600x400/F59E0B/white?text=Camiseta"]'
        },
        {
            "name": "Livro Python para Dados",
            "description": "Aprenda Python para análise de dados do zero ao avançado",
            "price": 79.90,
            "category": "Livros",
            "brand": "TechBooks",
            "stock": 30,
            "sku": "LIV-PY-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/EF4444/white?text=Python",
            "images_urls": '["https://placehold.co/600x400/EF4444/white?text=Python"]'
        },
        {
            "name": "Fone Bluetooth Pro Max",
            "description": "Fone de ouvido Bluetooth com cancelamento de ruído ativo",
            "price": 349.99,
            "original_price": 449.99,
            "category": "Eletrônicos",
            "brand": "SoundMax",
            "stock": 15,
            "sku": "FONE-BT-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/8B5CF6/white?text=Fone+Bluetooth",
            "images_urls": '["https://placehold.co/600x400/8B5CF6/white?text=Fone"]'
        },
        {
            "name": "Kit Completo Jardinagem",
            "description": "Kit completo para jardinagem doméstica com 15 peças",
            "price": 129.99,
            "category": "Casa",
            "brand": "GardenLife",
            "stock": 25,
            "sku": "KIT-JARDIM-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/EC4899/white?text=Jardinagem",
            "images_urls": '["https://placehold.co/600x400/EC4899/white?text=Jardinagem"]'
        },
        {
            "name": "Relógio Smart Watch Pro",
            "description": "Smart watch com monitor cardíaco, GPS e resistente à água",
            "price": 799.99,
            "original_price": 999.99,
            "category": "Eletrônicos",
            "brand": "WearTech",
            "stock": 12,
            "sku": "SW-PRO-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/6366F1/white?text=Smart+Watch",
            "images_urls": '["https://placehold.co/600x400/6366F1/white?text=Smart+Watch"]'
        },
        {
            "name": "Tênis Corrida Max",
            "description": "Tênis profissional para corrida com amortecimento premium",
            "price": 459.99,
            "original_price": 529.99,
            "category": "Esportes",
            "brand": "RunMax",
            "stock": 20,
            "sku": "TENIS-COR-001",
            "is_featured": True,
            "image_url": "https://placehold.co/600x400/14B8A6/white?text=Tenis+Corrida",
            "images_urls": '["https://placehold.co/600x400/14B8A6/white?text=Tenis"]'
        },
    ]
    for prod in products:
        r = requests.post(f"{BASE_URL}/api/products", json=prod, headers=headers)
        print(f"[PRODUCT] {prod['name']}: {r.status_code} - {r.json().get('id', 'error')[:8] if r.status_code == 201 else r.text}")
    
    # 6. Register a test user
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": "cliente@teste.com",
        "password": "cliente123",
        "full_name": "Cliente Teste"
    })
    print(f"[REGISTER CLIENT] Status: {r.status_code}")
    
    print("\n=== SEED COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()

