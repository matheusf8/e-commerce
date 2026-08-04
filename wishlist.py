from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import WishlistResponse, WishlistItemCreate
from app.services import WishlistService
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("", response_model=WishlistResponse)
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's wishlist."""
    return WishlistService.get_wishlist(db, current_user)

@router.post("/items", status_code=status.HTTP_201_CREATED, response_model=WishlistResponse)
async def add_to_wishlist(
    item_data: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an item to the wishlist."""
    item_added = WishlistService.add_to_wishlist(db, current_user, item_data)
    if item_added:
        # Se um novo item foi adicionado, retorna a wishlist atualizada
        return WishlistService.get_wishlist(db, current_user)
    # Se o item já existia, retorna a wishlist atual sem fazer outra consulta
    return WishlistService.get_wishlist(db, current_user)

@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an item from the wishlist by product_id."""
    WishlistService.remove_from_wishlist(db, current_user, product_id)
    return