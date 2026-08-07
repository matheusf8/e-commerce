"""Product service"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models import Product, Review
from app.schemas import ProductCreate, ProductUpdate

class ProductService:
    """Service for product operations"""

    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product"""
        # Check if SKU already exists
        existing = db.query(Product).filter(Product.sku == product_data.sku).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this SKU already exists"
            )
        
        product = Product(**product_data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_product(db: Session, product_id: str) -> Product:
        """Get product by ID (only active for customers)"""
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def get_product_admin(db: Session, product_id: str) -> Product:
        """Get product by ID (admin - includes inactive)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def list_products(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        category: str = None,
        min_price: float = None,
        max_price: float = None,
        search: str = None,
        sort_by: str = "created_at"
    ):
        """List products with filters"""
        query = db.query(Product).filter(Product.is_active == True)
        
        if category:
            query = query.filter(Product.category == category)
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        if search:
            query = query.filter(
                (Product.name.ilike(f"%{search}%")) |
                (Product.description.ilike(f"%{search}%"))
            )
        
        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating.desc())
        elif sort_by == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.created_at.desc())
        
        total = query.count()
        products = query.offset(skip).limit(limit).all()
        
        return {
            "items": products,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def update_product(db: Session, product_id: str, update_data: ProductUpdate) -> Product:
        """Update product (admin — includes inactive, e.g. to reactivate a soft-deleted product)"""
        product = ProductService.get_product_admin(db, product_id)
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id: str):
        """Soft delete product (admin — finds it even if already inactive, so this stays idempotent)"""
        product = ProductService.get_product_admin(db, product_id)
        product.is_active = False
        db.commit()

    @staticmethod
    def get_featured_products(db: Session, limit: int = 6):
        """Get featured products"""
        return db.query(Product).filter(
            and_(Product.is_featured == True, Product.is_active == True)
        ).limit(limit).all()

    @staticmethod
    def search_products(db: Session, query: str, limit: int = 10):
        """Search products"""
        return db.query(Product).filter(
            and_(
                (Product.name.ilike(f"%{query}%")) |
                (Product.description.ilike(f"%{query}%")),
                Product.is_active == True
            )
        ).limit(limit).all()

    @staticmethod
    def get_categories(db: Session):
        """Get all categories with at least one active product.

        Same bug class as get_product had before it was fixed: without the
        is_active filter, a soft-deleted product's category name lingers in
        this list forever (e.g. a leftover "Teste" category from admin CRUD
        testing), so the public catalog filter shows a category that always
        returns zero results.
        """
        return db.query(Product.category).filter(
            Product.is_active == True
        ).distinct().all()
