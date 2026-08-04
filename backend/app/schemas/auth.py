"""Auth schemas"""
from pydantic import BaseModel
from typing import Optional

class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str

class TokenPayload(BaseModel):
    """Token payload schema"""
    sub: str  # user_id
    exp: int
    iat: int
