"""Review endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import ReviewCreate, ReviewResponse, ReviewUpdate
from app.services import ReviewService
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.post("/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: str,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a product review"""
    return ReviewService.create_review(db, product_id, current_user, review_data.model_dump())

@router.get("/{product_id}", response_model=dict)
async def get_product_reviews(
    product_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get product reviews"""
    return ReviewService.get_product_reviews(db, product_id, skip, limit)

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    update_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update review"""
    return ReviewService.update_review(db, review_id, current_user, update_data.model_dump(exclude_unset=True))

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete review"""
    ReviewService.delete_review(db, review_id, current_user)
