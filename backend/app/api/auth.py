"""Authentication endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, RefreshTokenRequest, UserUpdate, UserDetailResponse
from app.services import AuthService
from app.auth import get_current_user
from app.models import User
from pydantic import BaseModel, Field
from typing import Optional

class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    user = AuthService.register(db, user_data)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and get tokens"""
    user, token_response = AuthService.login(db, login_data)
    return token_response

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_data: RefreshTokenRequest):
    """Refresh access token"""
    token_response = AuthService.refresh_token(refresh_data.refresh_token)
    return token_response

@router.get("/me", response_model=UserDetailResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserDetailResponse)
async def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    return AuthService.update_profile(db, current_user, update_data.model_dump(exclude_unset=True))

@router.put("/me/password")
async def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change current user password"""
    return AuthService.change_password(db, current_user, data.current_password, data.new_password)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard token)"""
    return {"message": "Successfully logged out"}

@router.get("/users/count")
async def get_users_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of registered users"""
    # Only admin can see this
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    from app.models import User as UserModel
    count = db.query(UserModel).count()
    return {"count": count}
