"""Transactional email service (Resend)"""
import logging
import resend
from app.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.resend_api_key


def _base_layout(title: str, body_html: str) -> str:
    """Shared branded wrapper (header/footer) around each email's specific content."""
    return f"""
    <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#f3f4f6; padding:32px 16px;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">
        <div style="background:#2563eb; padding:24px 32px;">
          <span style="color:#ffffff; font-size:22px; font-weight:bold;">⚡ E-Shop</span>
        </div>
        <div style="padding:32px;">
          <h1 style="font-size:20px; color:#111827; margin:0 0 16px;">{title}</h1>
          {body_html}
        </div>
        <div style="padding:20px 32px; background:#f9fafb; color:#9ca3af; font-size:12px;">
          Este é um email automático, não é preciso responder.<br>
          &copy; 2026 E-Shop — Todos os direitos reservados.
        </div>
      </div>
    </div>
    """


def _send(to_email: str, subject: str, html: str) -> None:
    """Fire-and-log: an email failure should never break the request that triggered
    it (registering, checking out) — just log it and move on."""
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY não configurado — pulando envio de email (%s -> %s)", subject, to_email)
        return
    try:
        resend.Emails.send({
            "from": settings.email_from,
            "to": [to_email],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        logger.error("Falha ao enviar email '%s' para %s: %s", subject, to_email, e)


class EmailService:
    """Transactional emails triggered by user/order events"""

    @staticmethod
    def send_welcome_email(to_email: str, name: str) -> None:
        body = f"""
          <p style="color:#374151; font-size:15px; line-height:1.6;">
            Oi, <strong>{name}</strong>! Seja bem-vindo(a) ao E-Shop 🎉
          </p>
          <p style="color:#374151; font-size:15px; line-height:1.6;">
            Sua conta foi criada com sucesso. Agora você já pode navegar pelo catálogo,
            favoritar produtos e finalizar suas compras com Pix, cartão ou Mercado Pago.
          </p>
          <a href="{settings.frontend_url}/catalog"
             style="display:inline-block; margin-top:8px; background:#2563eb; color:#ffffff;
                    text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600;">
            Explorar produtos
          </a>
        """
        _send(to_email, "Bem-vindo(a) ao E-Shop!", _base_layout("Bem-vindo(a)!", body))

    @staticmethod
    def send_order_confirmation_email(to_email: str, name: str, order: dict) -> None:
        items_rows = "".join(
            f"""<tr>
                  <td style="padding:8px 0; color:#374151; font-size:14px;">{item.get('product_name', 'Produto')} x{item.get('quantity', 1)}</td>
                  <td style="padding:8px 0; color:#111827; font-size:14px; text-align:right; font-weight:600;">R$ {item.get('subtotal', 0):.2f}</td>
                </tr>"""
            for item in order.get("items", [])
        )
        body = f"""
          <p style="color:#374151; font-size:15px; line-height:1.6;">
            Oi, <strong>{name}</strong>! Recebemos seu pedido <strong>#{order.get('id', '')[:8]}</strong> e ele já está sendo processado.
          </p>
          <table style="width:100%; border-collapse:collapse; margin:20px 0;">
            {items_rows}
            <tr><td colspan="2" style="border-top:1px solid #e5e7eb; padding-top:12px;"></td></tr>
            <tr>
              <td style="padding-top:8px; color:#111827; font-size:16px; font-weight:bold;">Total</td>
              <td style="padding-top:8px; color:#2563eb; font-size:16px; font-weight:bold; text-align:right;">R$ {order.get('total', 0):.2f}</td>
            </tr>
          </table>
          <p style="color:#374151; font-size:14px;">
            <strong>Entrega:</strong> {order.get('shipping_address', '')}, {order.get('city', '')} - {order.get('state', '')}
          </p>
          <a href="{settings.frontend_url}/order/{order.get('id', '')}"
             style="display:inline-block; margin-top:16px; background:#2563eb; color:#ffffff;
                    text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600;">
            Acompanhar pedido
          </a>
        """
        _send(to_email, f"Pedido confirmado #{order.get('id', '')[:8]}", _base_layout("Pedido confirmado! 📦", body))

    @staticmethod
    def send_password_reset_email(to_email: str, name: str, reset_link: str) -> None:
        body = f"""
          <p style="color:#374151; font-size:15px; line-height:1.6;">
            Oi, <strong>{name}</strong>. Recebemos um pedido para redefinir sua senha.
          </p>
          <a href="{reset_link}"
             style="display:inline-block; margin-top:8px; background:#2563eb; color:#ffffff;
                    text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600;">
            Redefinir senha
          </a>
          <p style="color:#9ca3af; font-size:13px; margin-top:20px;">
            Esse link expira em 30 minutos. Se você não pediu isso, pode ignorar este email com segurança.
          </p>
        """
        _send(to_email, "Redefinir sua senha — E-Shop", _base_layout("Redefinir senha 🔒", body))
