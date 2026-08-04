"""Wishlist endpoints"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth import get_current_user
from app.models import User, WishlistItem, Product

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("")
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user wishlist"""
    items = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()
    products = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            products.append({
                "id": item.id,
                "product_id": product.id,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "original_price": product.original_price,
                    "image_url": product.image_url,
                    "rating": product.rating,
                    "review_count": product.review_count,
                    "category": product.category,
                    "stock": product.stock,
                },
                "created_at": str(item.created_at)
            })
    return {"items": products, "count": len(products)}

@router.post("/{product_id}", status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add product to wishlist"""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product already in wishlist")
    
    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Product added to wishlist", "id": item.id}

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from wishlist"""
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
    
    db.delete(item)
    db.commit()

@router.get("/check/{product_id}")
async def check_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if product is in wishlist"""
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    return {"in_wishlist": existing is not None}

