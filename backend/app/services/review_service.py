"""Review service"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models import Review, Product, Order, OrderItem, User

class ReviewService:
    """Service for review operations"""

    @staticmethod
    def create_review(db: Session, product_id: str, user: User, review_data: dict) -> Review:
        """Create a product review"""
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if user already reviewed this product
        existing = db.query(Review).filter(
            Review.product_id == product_id,
            Review.user_id == user.id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already reviewed this product"
            )
        
        # Check if user bought the product
        is_verified = db.query(OrderItem).join(
            Order, OrderItem.order_id == Order.id
        ).filter(
            OrderItem.product_id == product_id,
            Order.user_id == user.id,
            Order.status == "delivered"
        ).first() is not None
        
        review = Review(
            product_id=product_id,
            user_id=user.id,
            rating=review_data["rating"],
            title=review_data["title"],
            comment=review_data.get("comment"),
            is_verified_purchase=1 if is_verified else 0
        )
        
        db.add(review)
        db.flush()
        
        # Update product rating
        ReviewService._update_product_rating(db, product_id)
        
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def get_product_reviews(db: Session, product_id: str, skip: int = 0, limit: int = 10):
        """Get product reviews"""
        total = db.query(Review).filter(Review.product_id == product_id).count()
        reviews = db.query(Review).filter(
            Review.product_id == product_id
        ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        
        # Include user name in response
        items = []
        for review in reviews:
            user = db.query(User).filter(User.id == review.user_id).first()
            review_data = {
                "id": review.id,
                "product_id": review.product_id,
                "user_id": review.user_id,
                "user_name": user.full_name if user else "Usuário",
                "rating": review.rating,
                "title": review.title,
                "comment": review.comment,
                "is_verified_purchase": bool(review.is_verified_purchase),
                "helpful_count": review.helpful_count,
                "created_at": review.created_at.isoformat() if review.created_at else None,
            }
            items.append(review_data)
        
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def update_review(db: Session, review_id: str, user: User, update_data: dict) -> Review:
        """Update review"""
        review = db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == user.id
        ).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        for field, value in update_data.items():
            if value is not None:
                setattr(review, field, value)
        
        db.flush()
        ReviewService._update_product_rating(db, review.product_id)
        db.commit()
        db.refresh(review)
        return review

    @staticmethod
    def delete_review(db: Session, review_id: str, user: User):
        """Delete review"""
        review = db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == user.id
        ).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        product_id = review.product_id
        db.delete(review)
        db.flush()
        ReviewService._update_product_rating(db, product_id)
        db.commit()

    @staticmethod
    def _update_product_rating(db: Session, product_id: str):
        """Update product rating based on reviews"""
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.product_id == product_id
        ).scalar()
        
        review_count = db.query(Review).filter(Review.product_id == product_id).count()
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.rating = float(avg_rating) if avg_rating else 0
            product.review_count = review_count
