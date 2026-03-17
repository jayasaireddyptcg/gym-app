from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from app.database.session import get_db
from app.models.user import User
from app.services.s3 import generate_presigned_upload_url, upload_avatar_to_s3, test_s3_connection, generate_presigned_get_url
from app.core.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])


# ------------------------
# Test S3 Connection (debug)
# ------------------------
@router.get("/test-s3")
def test_s3(current_user: User = Depends(get_current_user)):
    """Test S3 connectivity and permissions"""
    return test_s3_connection()


# ------------------------
# Generate presigned URL (scans)
# ------------------------
@router.post("/presign")
def presign_upload(current_user: User = Depends(get_current_user)):
    return generate_presigned_upload_url()


# ------------------------
# Upload avatar (server-side)
# ------------------------
@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    avatar_key = upload_avatar_to_s3(file, current_user.id)

    current_user.avatar = avatar_key
    db.commit()
    db.refresh(current_user)

    # Generate the full S3 URL
    avatar_url = f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{avatar_key}"

    return {
        "avatar_key": avatar_key,
        "avatar_url": avatar_url,
    }


# ------------------------
# Get presigned GET URL for viewing
# ------------------------
@router.get("/presigned-url/{image_key:path}")
def get_presigned_url(
    image_key: str,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a presigned GET URL for viewing an image stored in S3.
    The image_key should be the full S3 key (e.g., 'equipment-scans/uuid.jpg')
    """
    try:
        presigned_url = generate_presigned_get_url(image_key, expires_in=3600)
        return {
            "presigned_url": presigned_url,
            "expires_in": 3600
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")
