from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
import string
import time
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Auth"])


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# Store reset tokens with timestamps (in production, use Redis or database)
reset_tokens = {}  # {token: {"email": email, "created_at": timestamp}}


def generate_reset_token(length: int = 32) -> str:
    """Generate a secure random reset token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def cleanup_expired_tokens():
    """Remove tokens older than 1 hour"""
    current_time = time.time()
    expired_tokens = [
        token for token, data in reset_tokens.items()
        if current_time - data["created_at"] > 3600  # 1 hour = 3600 seconds
    ]
    for token in expired_tokens:
        del reset_tokens[token]


def is_token_valid(token: str) -> bool:
    """Check if token exists and is not expired"""
    if token not in reset_tokens:
        return False
    
    # Check if token is older than 1 hour
    current_time = time.time()
    if current_time - reset_tokens[token]["created_at"] > 3600:
        del reset_tokens[token]  # Remove expired token
        return False
    
    return True


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        name=req.name,
        hashed_password=hash_password(req.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Send welcome email
    try:
        email_service.send_welcome_email(user.email, user.name)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Send login notification
    try:
        email_service.send_login_notification(user.email, user.name)
    except Exception as e:
        print(f"Failed to send login notification: {e}")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email"""
    # Clean up expired tokens first
    cleanup_expired_tokens()
    
    user = db.query(User).filter(User.email == req.email).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
    # Generate reset token
    reset_token = generate_reset_token()
    reset_tokens[reset_token] = {
        "email": user.email,
        "created_at": time.time()
    }
    
    # Send reset email
    try:
        email_service.send_password_reset_email(user.email, user.name, reset_token)
    except Exception as e:
        print(f"Failed to send reset email: {e}")
        # Still return success to prevent email enumeration
    
    return {"message": "If an account with that email exists, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token"""
    # Check if token is valid (exists and not expired)
    if not is_token_valid(req.token):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    email = reset_tokens[req.token]["email"]
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update password
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    
    # Remove used token
    del reset_tokens[req.token]
    
    # Send confirmation email
    try:
        email_service.send_password_change_confirmation(user.email, user.name)
    except Exception as e:
        print(f"Failed to send password change confirmation: {e}")
    
    return {"message": "Password reset successfully"}
