"""User schemas"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, max_length=100)

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class UserResponse(UserBase):
    """User response schema"""
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    total_orders: float
    total_spent: float

    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    """Detailed user response"""
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
