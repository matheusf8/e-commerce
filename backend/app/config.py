"""Configuration settings"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./ecommerce.db")
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174")

    # Frontend (used to build Mercado Pago back_urls)
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # This backend's own public URL (used to build the Mercado Pago webhook
    # notification_url — only reachable once actually deployed, useless as
    # localhost since Mercado Pago's servers can't call back into it)
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")

    # Mercado Pago (sandbox/test credentials only — never commit a real APP_USR- token)
    mp_access_token: str = os.getenv("MP_ACCESS_TOKEN", "")
    # "Chave secreta" from the app's Webhooks config page, used to verify that a
    # webhook call really came from Mercado Pago. Leave empty in local dev (there's
    # no public URL for MP to call anyway); required once deployed.
    mp_webhook_secret: str = os.getenv("MP_WEBHOOK_SECRET", "")

    # Cloudinary (product image uploads)
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Resend (transactional email: boas-vindas, confirmação de pedido, redefinir senha)
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    email_from: str = os.getenv("EMAIL_FROM", "E-Shop <onboarding@resend.dev>")

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = True
    
    # Email (opcional)
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

settings = Settings()
