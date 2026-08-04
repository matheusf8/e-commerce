"""Cart endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import CartItemCreate, CartItemUpdate, CartResponse
from app.services import CartService
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/cart", tags=["Cart"])

@router.get("", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user cart"""
    return CartService.get_cart(db, current_user)

@router.post("/items", status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    CartService.add_to_cart(db, current_user, item_data)
    return CartService.get_cart(db, current_user)

@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    update_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update cart item quantity"""
    CartService.update_cart_item(db, current_user, item_id, update_data.quantity)
    return CartService.get_cart(db, current_user)

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    CartService.remove_from_cart(db, current_user, item_id)

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from cart"""
    CartService.clear_cart(db, current_user)
