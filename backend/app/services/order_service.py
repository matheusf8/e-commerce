"""Order service"""
import random
import mercadopago
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Order, OrderItem, CartItem, Product, User
from app.schemas import OrderCreate
from app.config import settings
import uuid


class PaymentSimulator:
    """Simula processamento de pagamento"""

    @staticmethod
    def process_payment(payment_method: str, card_data: dict = None) -> dict:
        """
        Simula a aprovação ou recusa do pagamento.
        - Pix: sempre aprovado (instantâneo)
        - Cartão: 80% chance de aprovação
        """
        if payment_method == "pix":
            return {
                "status": "completed",
                "message": "Pagamento PIX aprovado instantaneamente!",
                "transaction_id": str(uuid.uuid4())[:16].upper(),
                "payment_status": "completed"
            }

        # Simula processamento de cartão de crédito/débito
        # 80% chance de aprovação
        is_approved = random.random() < 0.8

        if is_approved:
            last_four = "****"
            if card_data and card_data.get("card_number"):
                last_four = card_data["card_number"][-4:]

            return {
                "status": "completed",
                "message": f"Pagamento aprovado! Cartão final {last_four}",
                "transaction_id": str(uuid.uuid4())[:16].upper(),
                "payment_status": "completed"
            }
        else:
            return {
                "status": "failed",
                "message": "Pagamento recusado. Verifique os dados do cartão ou tente outro método.",
                "transaction_id": None,
                "payment_status": "failed"
            }


class OrderService:
    """Service for order operations"""

    @staticmethod
    def _order_to_dict(order: Order) -> dict:
        """Convert Order model to dict for serialization"""
        # Get customer info if needed
        return {
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "total": order.total,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "shipping_cost": order.shipping_cost,
            "shipping_address": order.shipping_address,
            "city": order.city,
            "state": order.state,
            "zip_code": order.zip_code,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "payment_message": getattr(order, 'payment_message', None),
            "transaction_id": getattr(order, 'transaction_id', None),
            "tracking_number": order.tracking_number,
            "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name if item.product else None,
                    "quantity": item.quantity,
                    "price": item.price,
                    "subtotal": item.subtotal,
                }
                for item in order.items
            ] if order.items else []
        }

    @staticmethod
    def _order_to_detail_dict(order: Order, db: Session) -> dict:
        """Convert Order model to dict with customer info for admin"""
        order_dict = OrderService._order_to_dict(order)
        customer = db.query(User).filter(User.id == order.user_id).first()
        if customer:
            order_dict["customer"] = {
                "id": customer.id,
                "name": customer.full_name,
                "email": customer.email
            }
        return order_dict

    @staticmethod
    def create_order(db: Session, user: User, order_data: OrderCreate):
        """Create order from cart"""
        # Get cart items
        cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()

        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        # Calculate totals
        subtotal = 0
        tax_rate = 0.1  # 10% tax

        for item in cart_items:
            if item.product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {item.product.name}"
                )
            subtotal += item.product.price * item.quantity

        tax = subtotal * tax_rate
        shipping_cost = 10.0 if subtotal > 100 else 15.0  # Free shipping over $100
        total = subtotal + tax + shipping_cost

        # Process payment: "mercadopago" is a real gateway (Checkout Pro) that needs the
        # order to exist first (the preference references order.id), so it stays pending
        # here and is settled later by create_mp_preference/sync_mp_payment. Every other
        # method keeps using the simulator.
        if order_data.payment_method == "mercadopago":
            payment_result = {
                "status": "pending",
                "message": "Aguardando pagamento via Mercado Pago",
                "transaction_id": None,
                "payment_status": "pending",
            }
        else:
            card_data = {}
            if order_data.card_number:
                card_data["card_number"] = order_data.card_number
            if order_data.card_name:
                card_data["card_name"] = order_data.card_name

            payment_result = PaymentSimulator.process_payment(
                order_data.payment_method,
                card_data
            )

        # Determine order status based on payment
        order_status = "processing" if payment_result["payment_status"] == "completed" else "pending"

        # Create order
        order = Order(
            user_id=user.id,
            status=order_status,
            total=total,
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            shipping_address=order_data.shipping_address,
            city=order_data.city,
            state=order_data.state,
            zip_code=order_data.zip_code,
            payment_method=order_data.payment_method,
            payment_status=payment_result["payment_status"],
            tracking_number=str(uuid.uuid4())[:12].upper()
        )
        # Set payment message and transaction_id as attributes
        order.payment_message = payment_result["message"]
        order.transaction_id = payment_result.get("transaction_id")

        db.add(order)
        db.flush()  # Get order ID without committing

        # Create order items and update product stock
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
                subtotal=cart_item.product.price * cart_item.quantity
            )
            db.add(order_item)

            # Update product stock
            cart_item.product.stock -= cart_item.quantity

        # Update user totals
        user.total_orders += 1
        user.total_spent += total

        # Clear cart
        db.query(CartItem).filter(CartItem.user_id == user.id).delete()

        db.commit()
        db.refresh(order)

        # Attach payment info to the response
        order_dict = OrderService._order_to_dict(order)
        order_dict["payment_message"] = payment_result["message"]
        order_dict["payment_approved"] = payment_result["payment_status"] == "completed"

        return order_dict

    @staticmethod
    def retry_payment(db: Session, order_id: str, user: User) -> dict:
        """Retry payment for a failed order"""
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user.id
        ).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        if order.payment_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already completed"
            )

        if order.status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order is cancelled"
            )

        # Process payment again
        payment_result = PaymentSimulator.process_payment(order.payment_method)

        order.payment_status = payment_result["payment_status"]
        order.payment_message = payment_result["message"]
        order.transaction_id = payment_result.get("transaction_id")

        if payment_result["payment_status"] == "completed":
            order.status = "processing"

        db.commit()
        db.refresh(order)

        result = OrderService._order_to_dict(order)
        result["payment_message"] = payment_result["message"]
        result["payment_approved"] = payment_result["payment_status"] == "completed"

        return result

    @staticmethod
    def create_mp_preference(db: Session, order_id: str, user: User) -> dict:
        """Create a Mercado Pago Checkout Pro preference for an existing order.

        Checkout Pro is Mercado Pago's hosted payment page: we never touch card
        data ourselves, we just send the order items and get back a URL to redirect to.
        """
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user.id
        ).first()

        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if not settings.mp_access_token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Mercado Pago não está configurado (defina MP_ACCESS_TOKEN no .env)"
            )

        sdk = mercadopago.SDK(settings.mp_access_token)

        items = [
            {
                "title": item.product.name if item.product else "Produto",
                "quantity": item.quantity,
                "unit_price": item.price,
                "currency_id": "BRL",
            }
            for item in order.items
        ]

        preference_data = {
            "items": items,
            "external_reference": order.id,
            "back_urls": {
                "success": f"{settings.frontend_url}/order-confirmation?order_id={order.id}",
                "pending": f"{settings.frontend_url}/order-confirmation?order_id={order.id}",
                "failure": f"{settings.frontend_url}/checkout?retry={order.id}&mp_status=failure",
            },
        }
        # auto_return requires back_urls.success to be HTTPS — the Mercado Pago API
        # rejects it outright over plain http (as localhost is in dev). Without it,
        # the user just clicks "Voltar ao site" on Mercado Pago's own success page,
        # which works fine locally; production (with a real https domain) can add
        # "auto_return": "approved" back for a fully automatic redirect.
        if settings.frontend_url.startswith("https://"):
            preference_data["auto_return"] = "approved"

        result = sdk.preference().create(preference_data)
        if result.get("status") not in (200, 201):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Falha ao criar preferência no Mercado Pago: {result.get('response')}"
            )

        preference = result["response"]
        order.transaction_id = preference.get("id")
        db.commit()

        return {
            "preference_id": preference.get("id"),
            "init_point": preference.get("init_point"),
            "sandbox_init_point": preference.get("sandbox_init_point"),
        }

    @staticmethod
    def sync_mp_payment(db: Session, order_id: str, user: User, payment_id: str) -> dict:
        """Fetch the definitive payment status straight from Mercado Pago's API and
        update the order accordingly. Never trust the status query params the browser
        brings back from the redirect — those are only a hint to fetch the real thing."""
        order = OrderService.get_order(db, order_id, user)

        if not settings.mp_access_token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Mercado Pago não está configurado (defina MP_ACCESS_TOKEN no .env)"
            )

        sdk = mercadopago.SDK(settings.mp_access_token)
        result = sdk.payment().get(payment_id)
        if result.get("status") != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível confirmar o pagamento no Mercado Pago"
            )

        payment = result["response"]
        mp_status = payment.get("status")  # approved, pending, in_process, rejected, cancelled

        status_map = {
            "approved": "completed",
            "pending": "pending",
            "in_process": "pending",
            "rejected": "failed",
            "cancelled": "failed",
        }
        order.payment_status = status_map.get(mp_status, "pending")
        order.transaction_id = str(payment.get("id"))
        order.payment_message = f"Mercado Pago: {mp_status} ({payment.get('status_detail', '')})".strip()

        if order.payment_status == "completed":
            order.status = "processing"

        db.commit()
        db.refresh(order)

        result_dict = OrderService._order_to_dict(order)
        result_dict["payment_message"] = order.payment_message
        result_dict["payment_approved"] = order.payment_status == "completed"
        return result_dict

    @staticmethod
    def get_order(db: Session, order_id: str, user: User) -> Order:
        """Get order by ID (owner or admin can view any order)"""
        query = db.query(Order).filter(Order.id == order_id)

        # If not admin, restrict to own orders
        if not user.is_admin:
            query = query.filter(Order.user_id == user.id)

        order = query.first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order

    @staticmethod
    def get_order_detail(db: Session, order_id: str, user: User) -> dict:
        """Get order detail dict (owner or admin can view any order)"""
        order = OrderService.get_order(db, order_id, user)
        return OrderService._order_to_detail_dict(order, db)

    @staticmethod
    def list_user_orders(db: Session, user: User, skip: int = 0, limit: int = 10):
        """List user orders"""
        total = db.query(Order).filter(Order.user_id == user.id).count()
        orders = db.query(Order).filter(
            Order.user_id == user.id
        ).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "items": [OrderService._order_to_dict(o) for o in orders],
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def list_all_orders(db: Session, skip: int = 0, limit: int = 10):
        """List all orders (admin only) with customer info"""
        total = db.query(Order).count()
        orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

        items = []
        for order in orders:
            order_dict = OrderService._order_to_detail_dict(order, db)
            items.append(order_dict)

        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    def update_order_status(db: Session, order_id: str, status: str) -> dict:
        """Update order status (admin only) with customer info"""
        order = db.query(Order).filter(Order.id == order_id).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order status"
            )

        order.status = status
        db.commit()
        db.refresh(order)

        return OrderService._order_to_detail_dict(order, db)

    @staticmethod
    def cancel_order(db: Session, order_id: str, user: User) -> Order:
        """Cancel order"""
        order = OrderService.get_order(db, order_id, user)

        if order.status not in ["pending", "processing"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel this order"
            )

        # Restore product stock
        for item in order.items:
            item.product.stock += item.quantity

        order.status = "cancelled"
        db.commit()
        db.refresh(order)
        return order
