"""Script to seed database by calling the API"""
import requests

BASE_URL = "http://localhost:8000/api"

def create_admin():
    """Create admin user via register"""
    data = {
        "email": "admin@example.com",
        "password": "admin123",
        "full_name": "Admin User"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=data)
        if r.status_code == 201:
            print("✅ Admin user created!")
        elif r.status_code == 400 and "already registered" in str(r.json()):
            print("ℹ️  Admin user already exists")
        else:
            print(f"Admin register response: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Error creating admin: {e}")

def login_admin():
    """Login as admin and get token"""
    data = {"email": "admin@example.com", "password": "admin123"}
    r = requests.post(f"{BASE_URL}/auth/login", json=data)
    if r.status_code == 200:
        print("✅ Admin login successful!")
        return r.json()["access_token"]
    print(f"Login failed: {r.status_code} - {r.json()}")
    return None

def create_products(token):
    """Create sample products"""
    products = [
        {
            "name": "Laptop Premium",
            "description": "Laptop de alta performance para trabalho e gaming",
            "price": 3999.99,
            "original_price": 4999.99,
            "stock": 10,
            "category": "Eletrônicos",
            "sku": "LAPTOP-001",
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
            "is_featured": True
        },
        {
            "name": "Smartphone 5G",
            "description": "Smartphone último modelo com câmera 5G",
            "price": 1999.99,
            "original_price": 2499.99,
            "stock": 20,
            "category": "Eletrônicos",
            "sku": "PHONE-001",
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
            "is_featured": True
        },
        {
            "name": "Fone de Ouvido Sem Fio",
            "description": "Fone premium com cancelamento de ruído",
            "price": 599.99,
            "original_price": 799.99,
            "stock": 30,
            "category": "Acessórios",
            "sku": "HEADPHONE-001",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop"
        },
        {
            "name": "Smart Watch",
            "description": "Relógio inteligente com monitoramento de saúde",
            "price": 799.99,
            "stock": 15,
            "category": "Eletrônicos",
            "sku": "WATCH-001",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
            "is_featured": True
        },
        {
            "name": "Webcam Full HD",
            "description": "Webcam 1080p para streaming e videoconferência",
            "price": 299.99,
            "stock": 25,
            "category": "Acessórios",
            "sku": "WEBCAM-001",
            "image_url": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=400&fit=crop"
        },
        {
            "name": "Teclado Mecânico",
            "description": "Teclado RGB com switches mecânicos",
            "price": 499.99,
            "stock": 20,
            "category": "Acessórios",
            "sku": "KEYBOARD-001",
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop"
        },
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    created_count = 0
    
    for product in products:
        r = requests.post(f"{BASE_URL}/products", json=product, headers=headers)
        if r.status_code == 201:
            created_count += 1
            print(f"  ✅ Created: {product['name']}")
        elif r.status_code == 400 and "SKU already exists" in str(r.json()):
            print(f"  ℹ️  Already exists: {product['name']}")
        else:
            print(f"  ❌ Failed {product['name']}: {r.status_code} - {r.json()}")
    
    print(f"\n📊 Total products created: {created_count}")

def test_endpoints(token):
    """Test all main endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET products
    r = requests.get(f"{BASE_URL}/products")
    print(f"\n📦 GET /products: {r.status_code} - {len(r.json().get('items', []))} products")
    
    # Test GET featured
    r = requests.get(f"{BASE_URL}/products/featured")
    print(f"⭐ GET /products/featured: {r.status_code} - {len(r.json())} featured")
    
    # Test GET categories
    r = requests.get(f"{BASE_URL}/products/categories")
    print(f"🏷️ GET /products/categories: {r.status_code} - {r.json().get('categories', [])}")
    
    # Test GET /me
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"👤 GET /auth/me: {r.status_code} - {r.json().get('email')}")
    
    # Test cart
    r = requests.get(f"{BASE_URL}/cart", headers=headers)
    print(f"🛒 GET /cart: {r.status_code}")
    
    # Test orders
    r = requests.get(f"{BASE_URL}/orders/my-orders", headers=headers)
    print(f"📋 GET /orders: {r.status_code}")

if __name__ == "__main__":
    print("🌱 Seeding database via API...\n")
    
    create_admin()
    print()
    
    token = login_admin()
    if token:
        create_products(token)
        print("\n" + "="*50)
        print("🧪 Testing API Endpoints:")
        test_endpoints(token)
    
    print("\n" + "="*50)
    print("✅ Done!")
