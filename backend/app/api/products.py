"""Product endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import ProductCreate, ProductResponse, ProductDetailResponse, ProductUpdate, ProductListResponse
from app.services import ProductService
from app.auth import get_current_admin
from app.models import User
from typing import List

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=ProductListResponse)
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    search: str = Query(None),
    sort_by: str = Query("newest"),
    db: Session = Depends(get_db)
):
    """List all products with filters"""
    return ProductService.list_products(
        db, skip, limit, category, min_price, max_price, search, sort_by
    )

@router.get("/featured", response_model=List[ProductResponse])
async def get_featured(db: Session = Depends(get_db)):
    """Get featured products"""
    return ProductService.get_featured_products(db)

@router.get("/search", response_model=List[ProductResponse])
async def search_products(q: str = Query(...), db: Session = Depends(get_db)):
    """Search products"""
    return ProductService.search_products(db, q)

@router.get("/categories", response_model=dict)
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    categories = ProductService.get_categories(db)
    return {"categories": [c[0] for c in categories]}

# Admin endpoints (must be before /{product_id} to avoid route conflicts)
@router.get("/admin/all", response_model=ProductListResponse)
async def list_all_products_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_inactive: bool = Query(True),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List ALL products including inactive (admin only)"""
    from app.models import Product
    from sqlalchemy import and_
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product by ID"""
    return ProductService.get_product(db, product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new product (admin only)"""
    return ProductService.create_product(db, product_data)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update product (admin only)"""
    return ProductService.update_product(db, product_id, update_data)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete product (admin only)"""
    ProductService.delete_product(db, product_id)
