"""Cart service"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import CartItem, Product, User
from app.schemas import CartItemCreate

class CartService:
    """Service for cart operations"""

    @staticmethod
    def add_to_cart(db: Session, user: User, cart_data: CartItemCreate):
        """Add product to cart"""
        # Check if product exists and is active
        product = db.query(Product).filter(
            Product.id == cart_data.product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        if product.stock < cart_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        # Check if item already in cart
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == cart_data.product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += cart_data.quantity
        else:
            cart_item = CartItem(
                user_id=user.id,
                product_id=cart_data.product_id,
                quantity=cart_data.quantity
            )
            db.add(cart_item)
        
        db.commit()
        db.refresh(cart_item)
        return cart_item

    @staticmethod
    def get_cart(db: Session, user: User):
        """Get user cart"""
        items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
        
        total = 0
        item_count = 0
        items_data = []
        
        for item in items:
            product = item.product
            subtotal = product.price * item.quantity
            total += subtotal
            item_count += item.quantity
            
            items_data.append({
                "id": item.id,
                "product_id": product.id,
                "product_name": product.name,
                "price": product.price,
                "quantity": item.quantity,
                "subtotal": subtotal
            })
        
        return {
            "user_id": user.id,
            "items": items_data,
            "total": total,
            "item_count": item_count
        }

    @staticmethod
    def update_cart_item(db: Session, user: User, item_id: str, quantity: int):
        """Update cart item quantity"""
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user.id
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        if quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return None
        
        # Check stock
        if cart_item.product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        cart_item.quantity = quantity
        db.commit()
        db.refresh(cart_item)
        return cart_item

    @staticmethod
    def remove_from_cart(db: Session, user: User, item_id: str):
        """Remove item from cart"""
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user.id
        ).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        db.delete(cart_item)
        db.commit()

    @staticmethod
    def clear_cart(db: Session, user: User):
        """Clear all items from cart"""
        db.query(CartItem).filter(CartItem.user_id == user.id).delete()
        db.commit()

    @staticmethod
    def get_cart_total(db: Session, user: User) -> float:
        """Get cart total"""
        items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
        total = sum(item.product.price * item.quantity for item in items)
        return total
