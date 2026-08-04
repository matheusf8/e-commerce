"""Category endpoints"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService
from app.auth import get_current_admin
from app.models import User
from typing import List

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    """List all categories"""
    return CategoryService.list_categories(db, include_inactive)

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: Session = Depends(get_db)):
    """Get category by ID"""
    return CategoryService.get_category(db, category_id)

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new category (admin only)"""
    return CategoryService.create_category(db, data.name, data.description)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update category (admin only)"""
    return CategoryService.update_category(db, category_id, data.model_dump(exclude_unset=True))

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete category (admin only)"""
    CategoryService.delete_category(db, category_id)

