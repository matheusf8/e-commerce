"""Order endpoints"""
import hmac
import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.database import get_db
from app.schemas import OrderCreate
from app.services import OrderService
from app.auth import get_current_user, get_current_admin
from app.models import User
from app.config import settings

logger = logging.getLogger(__name__)

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


def _verify_mp_signature(request: Request, data_id: str) -> bool:
    """Verify a Mercado Pago webhook really came from Mercado Pago.

    Recipe from Mercado Pago's docs: HMAC-SHA256 over a manifest string, keyed by
    the "Chave secreta" configured for the app's webhooks. If MP_WEBHOOK_SECRET
    isn't set (e.g. still setting things up, or running locally where MP can't
    reach this endpoint at all), verification is skipped — this must be
    configured before relying on this endpoint in production.
    """
    if not settings.mp_webhook_secret:
        logger.warning("MP webhook received but MP_WEBHOOK_SECRET is not set — skipping signature check")
        return True

    signature_header = request.headers.get("x-signature", "")
    request_id = request.headers.get("x-request-id", "")
    parts = dict(p.split("=", 1) for p in signature_header.split(",") if "=" in p)
    ts = parts.get("ts", "")
    received_hash = parts.get("v1", "")
    if not ts or not received_hash:
        return False

    manifest = f"id:{data_id.lower()};request-id:{request_id};ts:{ts};"
    computed_hash = hmac.new(
        settings.mp_webhook_secret.encode(), manifest.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed_hash, received_hash)


@router.post("/webhook/mercadopago")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    """Server-to-server notification Mercado Pago calls when a payment's status
    changes — this is what makes payment confirmation work even if the customer
    closes the tab instead of clicking back to the site. Only reachable once this
    backend is deployed behind a public URL (registered as notification_url on
    the preference); does nothing useful against localhost.
    """
    payload = await request.json()
    data_id = str(request.query_params.get("data.id") or payload.get("data", {}).get("id") or "")
    notif_type = request.query_params.get("type") or payload.get("type")

    if not data_id or notif_type != "payment":
        return {"status": "ignored"}

    if not _verify_mp_signature(request, data_id):
        logger.warning("MP webhook signature mismatch, ignoring payload for payment %s", data_id)
        return {"status": "invalid_signature"}

    OrderService.handle_mp_webhook(db, data_id)
    return {"status": "ok"}
