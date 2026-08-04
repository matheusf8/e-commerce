"""Product schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    category: str = Field(..., min_length=2, max_length=50)
    brand: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    sku: str = Field(..., min_length=3, max_length=50)
    image_url: Optional[str] = None
    images_urls: Optional[str] = None  # JSON array

class ProductCreate(ProductBase):
    """Product creation schema"""
    is_active: Optional[bool] = True
    is_featured: Optional[bool] = False

class ProductUpdate(BaseModel):
    """Product update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductResponse(ProductBase):
    """Product response schema"""
    id: str
    rating: float
    review_count: int
    image_url: Optional[str]
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    """Detailed product response"""
    is_active: bool
    updated_at: datetime

class ProductListResponse(BaseModel):
    """Product list paginated response"""
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int
