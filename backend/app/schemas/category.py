"""Category schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CategoryCreate(BaseModel):
    """Category creation schema"""
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    """Category update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(BaseModel):
    """Category response schema"""
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

