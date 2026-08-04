"""Order schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class OrderItemCreate(BaseModel):
    """Order item creation schema"""
    product_id: str
    quantity: int = Field(..., ge=1)

class OrderItemResponse(BaseModel):
    """Order item response schema"""
    id: str
    product_id: str
    quantity: int
    price: float
    subtotal: float
    product_name: str = ""

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    """Order creation schema"""
    shipping_address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    zip_code: str = Field(..., min_length=5)
    payment_method: str
    card_number: Optional[str] = None
    card_name: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None

class OrderResponse(BaseModel):
    """Order response schema"""
    id: str
    user_id: str
    status: str
    total: float
    subtotal: float
    tax: float
    shipping_cost: float
    shipping_address: str
    city: str
    state: str
    zip_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderDetailResponse(OrderResponse):
    """Detailed order response"""
    items: List[OrderItemResponse]
    payment_method: str
    payment_status: str
    payment_message: Optional[str] = None
    payment_approved: bool = False
    tracking_number: Optional[str]
    estimated_delivery: Optional[datetime]
    updated_at: datetime
