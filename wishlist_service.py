from sqlalchemy.orm import Session
from app.models import User, WishlistItem, Product
from app.schemas import WishlistItemCreate, WishlistResponse, WishlistItemResponse
from fastapi import HTTPException, status

class WishlistService:

    @staticmethod
    def get_wishlist(db: Session, user: User) -> WishlistResponse:
        items = db.query(WishlistItem).filter(WishlistItem.user_id == user.id).all()
        
        response_items = []
        for item in items:
            product = item.product
            response_items.append(WishlistItemResponse(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                product_image_url=product.image_url,
                product_price=product.price
            ))

        return WishlistResponse(items=response_items, count=len(response_items))

    @staticmethod
    def add_to_wishlist(db: Session, user: User, item_data: WishlistItemCreate):
        # Verifica se o produto existe
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        # Verifica se o item já está na wishlist
        existing_item = db.query(WishlistItem).filter(
            WishlistItem.user_id == user.id,
            WishlistItem.product_id == item_data.product_id
        ).first()

        if existing_item:
            # Se já existe, não faz nada ou retorna uma mensagem específica.
            # Aqui, simplesmente não adicionamos de novo.
            return None

        new_item = WishlistItem(user_id=user.id, product_id=item_data.product_id)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

    @staticmethod
    def remove_from_wishlist(db: Session, user: User, product_id: str):
        item_to_delete = db.query(WishlistItem).filter(
            WishlistItem.user_id == user.id,
            WishlistItem.product_id == product_id
        ).first()

        if not item_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in wishlist"
            )

        db.delete(item_to_delete)
        db.commit()