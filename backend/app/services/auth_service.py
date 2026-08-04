"""Authentication service"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse
from app.auth.jwt import JWTHandler, PasswordHandler
from app.services.email_service import EmailService
from app.config import settings
from datetime import timedelta

class AuthService:
    """Service for authentication operations"""

    @staticmethod
    def register(db: Session, user_data: UserCreate) -> User:
        """Register a new user"""
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=PasswordHandler.hash_password(user_data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        EmailService.send_welcome_email(user.email, user.full_name)

        return user

    @staticmethod
    def login(db: Session, login_data: UserLogin) -> tuple[User, TokenResponse]:
        """Authenticate user and return tokens"""
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not PasswordHandler.verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Generate tokens
        access_token = JWTHandler.create_access_token(data={"sub": user.id})
        refresh_token = JWTHandler.create_refresh_token(data={"sub": user.id})
        
        token_response = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
        return user, token_response

    @staticmethod
    def refresh_token(token: str) -> TokenResponse:
        """Refresh access token using refresh token"""
        user_id = JWTHandler.verify_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        access_token = JWTHandler.create_access_token(data={"sub": user_id})
        return TokenResponse(access_token=access_token)

    @staticmethod
    def get_profile(user: User):
        """Get user profile"""
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "total_orders": user.total_orders,
            "total_spent": user.total_spent,
            "created_at": user.created_at,
        }

    @staticmethod
    def update_profile(db: Session, user: User, update_data: dict) -> User:
        """Update user profile"""
        for field, value in update_data.items():
            if value is not None:
                setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def change_password(db: Session, user: User, current_password: str, new_password: str) -> dict:
        """Change user password"""
        from app.auth.jwt import PasswordHandler
        if not PasswordHandler.verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        user.password_hash = PasswordHandler.hash_password(new_password)
        db.commit()
        return {"message": "Password changed successfully"}

    @staticmethod
    def forgot_password(db: Session, email: str) -> dict:
        """Send a password reset email if the address is registered.

        Always returns the same generic message regardless of whether the email
        exists — revealing that would let an attacker enumerate registered users.
        """
        user = db.query(User).filter(User.email == email).first()
        if user:
            reset_token = JWTHandler.create_access_token(
                data={"sub": user.id, "purpose": "password_reset"},
                expires_delta=timedelta(minutes=30),
            )
            reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"
            EmailService.send_password_reset_email(user.email, user.full_name, reset_link)

        return {"message": "Se esse email estiver cadastrado, enviamos um link de redefinição."}

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> dict:
        """Finalize a password reset started by forgot_password"""
        payload = JWTHandler.verify_token_payload(token)
        if not payload or payload.get("purpose") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Link de redefinição inválido ou expirado"
            )

        user = db.query(User).filter(User.id == payload.get("sub")).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

        user.password_hash = PasswordHandler.hash_password(new_password)
        db.commit()
        return {"message": "Senha redefinida com sucesso"}
