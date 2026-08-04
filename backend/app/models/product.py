"""Product model"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.database import Base

class Product(Base):
    """Product model"""
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)  # For discounts
    category = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    sku = Column(String, unique=True, index=True, nullable=False)
    
    # Ratings
    rating = Column(Float, default=0)
    review_count = Column(Integer, default=0)
    
    # Images
    image_url = Column(String, nullable=True)
    images_urls = Column(String, nullable=True)  # JSON array
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product {self.name}>"
