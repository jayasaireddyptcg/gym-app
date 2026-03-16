import boto3
import uuid
from io import BytesIO
from uuid import uuid4
from typing import Optional
from PIL import Image
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.core.config import settings

# -------------------------
# S3 CLIENT (singleton)
# -------------------------
s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)

BUCKET_NAME = settings.aws_bucket_name

# Folder prefixes (LOCK THESE)
EQUIPMENT_PREFIX = settings.equipment_prefix
FOOD_PREFIX = settings.food_prefix
AVATAR_FOLDER = settings.avatar_folder


# -------------------------
# PRESIGNED UPLOAD URL
# -------------------------
def generate_presigned_upload_url(
    *,
    content_type: str = "image/jpeg",
    is_food: bool = False,
    expires_in: int = 300,
) -> dict:
    """
    Generates a presigned PUT URL for direct upload from mobile.
    """
    prefix = FOOD_PREFIX if is_food else EQUIPMENT_PREFIX
    key = f"{prefix}{uuid4()}.jpg"

    try:
        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned URL: {e}")

    return {
        "upload_url": url,
        "file_key": key,
    }


# -------------------------
# LOAD IMAGE FOR AI
# -------------------------
def load_image_from_s3(key: str) -> Image.Image:
    """
    Loads an image from S3 and returns a PIL Image (RGB).
    Used by AI inference.
    """
    try:
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        image_bytes = obj["Body"].read()
        return Image.open(BytesIO(image_bytes)).convert("RGB")
    except ClientError:
        raise ValueError("Image not found in S3")
    except Exception:
        raise ValueError("Invalid image file")


# -------------------------
# DOWNLOAD RAW BYTES (optional)
# -------------------------
def download_file_bytes(key: str) -> bytes:
    """
    Returns raw bytes from S3 (useful for debugging or logging).
    """
    try:
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        return obj["Body"].read()
    except ClientError:
        raise ValueError("File not found in S3")


# -------------------------
# DELETE FILE (optional)
# -------------------------
def delete_file(key: str) -> None:
    """
    Deletes a file from S3.
    """
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=key)
    except ClientError:
        # Safe to ignore in MVP
        pass


# -------------------------
# TEST S3 CONNECTION
# -------------------------
def test_s3_connection() -> dict:
    """
    Tests S3 connection and permissions.
    Returns diagnostic information.
    """
    try:
        # Test basic connectivity by listing buckets
        buckets = s3.list_buckets()
        bucket_names = [bucket['Name'] for bucket in buckets['Buckets']]
        
        # Check if our bucket exists
        bucket_exists = BUCKET_NAME in bucket_names
        
        # Test bucket access by trying to list objects (with prefix)
        try:
            objects = s3.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=1)
            can_list = True
        except ClientError as e:
            can_list = False
            list_error = str(e)
        
        return {
            "connected": True,
            "bucket_exists": bucket_exists,
            "can_list_objects": can_list,
            "available_buckets": bucket_names,
            "target_bucket": BUCKET_NAME,
            "list_error": list_error if not can_list else None
        }
    except ClientError as e:
        return {
            "connected": False,
            "error": str(e),
            "error_code": e.response.get('Error', {}).get('Code', 'Unknown')
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }


# -------------------------
# AVATAR UPLOAD
# -------------------------
def upload_avatar_to_s3(file: UploadFile, user_id: int) -> str:
    """
    Uploads a user avatar to S3 and returns the S3 key.
    """
    try:
        extension = file.filename.split(".")[-1].lower()
        filename = f"{uuid.uuid4()}.{extension}"

        s3_key = f"{AVATAR_FOLDER}/{user_id}/{filename}"

        # Get content type, fallback to jpeg if None
        content_type = getattr(file, 'content_type', None) or 'image/jpeg'

        s3.upload_fileobj(
            file.file,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={
                "ContentType": content_type
            }
        )

        return s3_key
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', 'Unknown error')
        print(f"S3 Upload Error - Code: {error_code}, Message: {error_message}")
        print(f"Bucket: {BUCKET_NAME}, Key: {s3_key}")
        raise RuntimeError(f"S3 upload failed: {error_code} - {error_message}")
    except Exception as e:
        print(f"Unexpected upload error: {str(e)}")
        raise RuntimeError(f"Upload failed: {str(e)}")


# -------------------------
# GENERIC FILE UPLOAD
# -------------------------
async def upload_file_to_s3(file: UploadFile, key: str) -> str:
    """
    Generic file upload to S3 with custom key.
    Returns the S3 key.
    """
    try:
        # Reset file pointer
        file.file.seek(0)
        
        # Get content type, fallback to jpeg if None
        content_type = getattr(file, 'content_type', None) or 'image/jpeg'

        s3.upload_fileobj(
            file.file,
            BUCKET_NAME,
            key,
            ExtraArgs={
                "ContentType": content_type
            }
        )

        return key
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', 'Unknown error')
        print(f"S3 Upload Error - Code: {error_code}, Message: {error_message}")
        print(f"Bucket: {BUCKET_NAME}, Key: {key}")
        raise RuntimeError(f"S3 upload failed: {error_code} - {error_message}")
    except Exception as e:
        print(f"Unexpected upload error: {str(e)}")
        raise RuntimeError(f"Upload failed: {str(e)}")
