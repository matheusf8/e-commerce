"""Order endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.database import get_db
from app.schemas import OrderCreate
from app.services import OrderService
from app.auth import get_current_user, get_current_admin
from app.models import User

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order (checkout)"""
    return OrderService.create_order(db, current_user, order_data)


@router.get("/my-orders")
async def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user orders"""
    return OrderService.list_user_orders(db, current_user, skip, limit)


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order by ID (owner or admin can view)"""
    return OrderService.get_order_detail(db, order_id, current_user)


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel order"""
    return OrderService.cancel_order(db, order_id, current_user)


# Admin endpoints


@router.get("")
async def list_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List ALL orders with customer info (admin only)"""
    return OrderService.list_all_orders(db, skip, limit)


class OrderStatusUpdate(BaseModel):
    """Order status update schema"""
    status: str = Field(..., description="New order status (pending, processing, shipped, delivered, cancelled)")


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update order status (admin only) - e.g. change from 'processing' to 'shipped' to 'delivered'"""
    return OrderService.update_order_status(db, order_id, status_data.status)


@router.post("/{order_id}/retry-payment")
async def retry_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retry payment for a failed order"""
    return OrderService.retry_payment(db, order_id, current_user)


@router.post("/{order_id}/mp-preference")
async def create_mp_preference(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Mercado Pago Checkout Pro preference and return its payment URL"""
    return OrderService.create_mp_preference(db, order_id, current_user)


class MpSyncRequest(BaseModel):
    """Body for syncing a Mercado Pago payment status"""
    payment_id: str


@router.post("/{order_id}/mp-sync")
async def sync_mp_payment(
    order_id: str,
    sync_data: MpSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm the real payment status with Mercado Pago's API and update the order"""
    return OrderService.sync_mp_payment(db, order_id, current_user, sync_data.payment_id)
