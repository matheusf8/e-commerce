"""User admin endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth import get_current_admin
from app.models import User

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/count")
async def count_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Count total registered users (admin only)"""
    count = db.query(User).count()
    return {"count": count}
