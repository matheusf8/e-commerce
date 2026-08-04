"""Database seed with sample data"""
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models import Base, User, Product
from app.auth.jwt import PasswordHandler
import uuid

def init_db():
    """Create tables and seed data"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Create admin user if not exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            password_hash=PasswordHandler.hash_password("admin123"),
            full_name="Admin User",
            is_admin=True,
            is_active=True,
            phone="11999999999",
            address="Admin Address",
            city="São Paulo",
            state="SP",
            zip_code="01000000",
        )
        db.add(admin)
        db.commit()

    # Create sample products if not exists
    if db.query(Product).count() == 0:
        products = [
            Product(
                id=str(uuid.uuid4()),
                name="Laptop Premium",
                description="Laptop de alta performance para trabalho e gaming",
                price=3999.99,
                original_price=4999.99,
                stock=10,
                category="Eletrônicos",
                sku="LAPTOP-001",
                is_featured=True,
                rating=4.5,
                review_count=15,
                image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Smartphone 5G",
                description="Smartphone último modelo com câmera 5G",
                price=1999.99,
                original_price=2499.99,
                stock=20,
                category="Eletrônicos",
                sku="PHONE-001",
                is_featured=True,
                rating=4.8,
                review_count=42,
                image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Fone de Ouvido Sem Fio",
                description="Fone premium com cancelamento de ruído",
                price=599.99,
                original_price=799.99,
                stock=30,
                category="Acessórios",
                sku="HEADPHONE-001",
                rating=4.3,
                review_count=28,
                image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Smart Watch",
                description="Relógio inteligente com monitoramento de saúde",
                price=799.99,
                stock=15,
                category="Eletrônicos",
                sku="WATCH-001",
                is_featured=True,
                rating=4.6,
                review_count=34,
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Webcam Full HD",
                description="Webcam 1080p para streaming e videoconferência",
                price=299.99,
                stock=25,
                category="Acessórios",
                sku="WEBCAM-001",
                rating=4.2,
                review_count=18,
                image_url="https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=400&fit=crop",
            ),
            Product(
                id=str(uuid.uuid4()),
                name="Teclado Mecânico",
                description="Teclado RGB com switches mecânicos",
                price=499.99,
                stock=20,
                category="Acessórios",
                sku="KEYBOARD-001",
                rating=4.7,
                review_count=45,
                image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
            ),
        ]
        
        for product in products:
            db.add(product)
        
        db.commit()

    db.close()
    print("✅ Database initialized successfully!")

if __name__ == "__main__":
    init_db()
