from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserProfileResponse, UpdateProfileRequest
from app.core.deps import get_current_user
from app.core.security import verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Users"])


# ------------------------
# Get current user profile
# ------------------------
@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ------------------------
# Update profile
# ------------------------
@router.put("/me")
def update_profile(
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 🔒 Check email uniqueness (exclude current user)
    if req.email:
        existing = (
            db.query(User)
            .filter(User.email == req.email, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already in use by another account",
            )

    current_user.name = req.name
    current_user.email = req.email
    current_user.phone = req.phone
    current_user.bio = req.bio
    current_user.avatar = req.avatar

    db.commit()
    db.refresh(current_user)

    return {"success": True}


# ------------------------
# Change password
# ------------------------
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    current_user.hashed_password = hash_password(req.new_password)
    db.commit()

    return {"success": True}
