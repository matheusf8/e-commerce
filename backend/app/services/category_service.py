"""Category service"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Category

class CategoryService:
    """Service for category operations"""

    @staticmethod
    def create_category(db: Session, name: str, description: str = None) -> Category:
        """Create a new category"""
        existing = db.query(Category).filter(Category.name == name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category already exists"
            )
        category = Category(name=name, description=description)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def list_categories(db: Session, include_inactive: bool = False):
        """List all categories"""
        query = db.query(Category)
        if not include_inactive:
            query = query.filter(Category.is_active == True)
        return query.order_by(Category.name).all()

    @staticmethod
    def get_category(db: Session, category_id: str) -> Category:
        """Get category by ID"""
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        return category

    @staticmethod
    def update_category(db: Session, category_id: str, update_data: dict) -> Category:
        """Update category"""
        category = CategoryService.get_category(db, category_id)
        for field, value in update_data.items():
            if value is not None:
                setattr(category, field, value)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db: Session, category_id: str):
        """Delete category (soft delete)"""
        category = CategoryService.get_category(db, category_id)
        category.is_active = False
        db.commit()

