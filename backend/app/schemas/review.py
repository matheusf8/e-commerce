"""Review schemas"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    """Review creation schema"""
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=3, max_length=255)
    comment: Optional[str] = Field(None, max_length=5000)

class ReviewUpdate(BaseModel):
    """Review update schema"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    """Review response schema"""
    id: str
    product_id: str
    user_id: str
    rating: int
    title: str
    comment: Optional[str]
    is_verified_purchase: bool
    helpful_count: int
    created_at: datetime

    class Config:
        from_attributes = True
