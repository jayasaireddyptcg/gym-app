from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re
from app.core.config import settings

class UserProfileResponse(BaseModel):
    name: Optional[str]
    email: EmailStr
    phone: Optional[str]
    bio: Optional[str]
    avatar: Optional[str]
    
    @validator('avatar', pre=True, always=True)
    def convert_avatar_key_to_url(cls, v):
        """Convert S3 key to full URL if it's not already a URL"""
        if v is None:
            return None
        
        # If it's already a full URL, return as-is
        if v.startswith('http'):
            return v
        
        # If it's an S3 key, convert to full URL
        if v.startswith(settings.avatar_folder):
            return f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{v}"
        
        # Return as-is if it doesn't match expected patterns
        return v

class UpdateProfileRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        
        # Remove all non-digit characters for validation
        phone_digits = re.sub(r'[^\d]', '', v)
        
        # Validate phone number formats
        # Accept: 10-digit numbers, numbers with country code (+1, +91, etc.)
        if len(phone_digits) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        
        if len(phone_digits) > 15:
            raise ValueError('Phone number cannot have more than 15 digits')
        
        # Check if it's a valid phone number pattern
        # Allow formats: +1234567890, 1234567890, (123) 456-7890, 123-456-7890, etc.
        phone_pattern = r'^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}[-\s\.]?[0-9]{1,9}[-\s\.]?[0-9]{1,9}$'
        
        if not re.match(phone_pattern, v):
            raise ValueError('Invalid phone number format')
        
        return v
