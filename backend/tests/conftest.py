"""
Pytest configuration file for backend tests.
This file sets up a separate, temporary database for testing and seeds it with data.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add backend directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import Base, get_db
from main import app
from app.models import Product
from app.config import settings

# --- Test Database Setup ---
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Override `get_db` Dependency ---
def override_get_db():
    """Overrides the get_db dependency to use the test database."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the override to the FastAPI app
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def seed_test_db():
    """
    Session-wide fixture to create, seed, and tear down the test database.
    `autouse=True` makes it run automatically for the session.

    Always resets the schema first so re-running the suite is idempotent:
    tests mutate data (e.g. decrement product stock when placing orders), so
    reusing a `test.db` left over from a previous run would make stock-dependent
    tests fail spuriously on the second run.
    """
    # --- Setup ---
    # Drop and recreate all tables so each test session starts from a clean slate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    # Check if products already exist
    if db.query(Product).count() == 0:
        print("Seeding test database with products...")
        products = [
            Product(
                name="Laptop de Teste",
                description="Laptop para testes de integração",
                price=1999.99,
                stock=10,
                category="Eletrônicos",
                sku="TEST-LP-01"
            ),
            Product(
                name="Smartphone de Teste",
                description="Smartphone para testes de API",
                price=999.99,
                stock=20,
                category="Eletrônicos",
                sku="TEST-SP-01"
            ),
        ]
        db.add_all(products)
        db.commit()
        print("Test database seeded.")
    else:
        print("Test database already seeded.")
        
    db.close()

    # --- Run Tests ---
    yield
    
    # --- Teardown ---
    # Drop all tables from the test database
    # Base.metadata.drop_all(bind=engine)
    
    # Delete the test database file
    # Note: This might cause issues on Windows if the file is locked.
    # It's often fine to leave the test.db file.
    if os.path.exists("./test.db"):
        # os.remove("./test.db") # Commented out for safety on all platforms
        pass
    print("Test session finished.")

@pytest.fixture(scope="module")
def client():
    """
    A TestClient fixture that can be used in tests.
    This client uses the app with the overridden database dependency.
    """
    with TestClient(app) as c:
        yield c
