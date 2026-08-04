"""API Routes"""
from fastapi import APIRouter
from app.api import auth, products, cart, orders, reviews, wishlist, categories, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(reviews.router)
api_router.include_router(wishlist.router)
api_router.include_router(categories.router)
api_router.include_router(users.router)

__all__ = ["api_router"]
