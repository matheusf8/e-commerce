"""Cart schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Any

class CartItemCreate(BaseModel):
    """Cart item creation schema"""
    product_id: str
    quantity: int = Field(..., ge=1, le=9999)

class CartItemUpdate(BaseModel):
    """Cart item update schema"""
    quantity: int = Field(..., ge=1, le=9999)

class CartItemResponse(BaseModel):
    """Cart item response schema"""
    id: str
    product_id: str
    product_name: str = ""
    price: float = 0
    quantity: int
    subtotal: float = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    """Cart response schema"""
    user_id: str
    items: List[CartItemResponse]
    total: float
    item_count: int
