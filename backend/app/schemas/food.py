from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime, date
from app.services.s3 import generate_presigned_get_url
from app.core.config import settings

# Food Item schemas
class FoodItemBase(BaseModel):
    name: str
    brand: Optional[str] = None
    category: str
    calories_per_100g: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0
    cholesterol_mg: float = 0
    saturated_fat_g: float = 0
    trans_fat_g: float = 0
    vitamin_a_mcg: float = 0
    vitamin_c_mg: float = 0
    calcium_mg: float = 0
    iron_mg: float = 0
    potassium_mg: float = 0
    serving_size: str = '100g'

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Food Analysis schemas
class FoodAnalysisItem(BaseModel):
    name: str
    category: str
    quantity_g: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0

class FoodAnalysisResult(BaseModel):
    foods: List[FoodAnalysisItem]
    confidence: float
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float = 0
    total_sugar_g: float = 0
    total_sodium_mg: float = 0
    error: Optional[str] = None

# Food Scan schemas
class FoodScanBase(BaseModel):
    image_url: str
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float = 0
    total_sugar_g: float = 0
    total_sodium_mg: float = 0
    meal_type: Optional[str] = None
    confidence_score: float = 0.0
    notes: Optional[str] = None

class FoodScanCreate(FoodScanBase):
    pass

class FoodScan(FoodScanBase):
    id: int
    user_id: int
    scan_date: datetime
    created_at: datetime

    @field_serializer('image_url')
    def serialize_image_url(self, image_url: str) -> str:
        """Convert S3 URL to presigned URL if it's an S3 key"""
        # Check if it's already a presigned URL (contains query params)
        if '?' in image_url and 'Signature' in image_url:
            return image_url
        
        # Check if it's a full S3 URL
        if image_url.startswith('https://'):
            # Extract the S3 key from the URL
            bucket_url = f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/"
            if image_url.startswith(bucket_url):
                s3_key = image_url.replace(bucket_url, '')
                try:
                    return generate_presigned_get_url(s3_key, expires_in=3600)
                except:
                    return image_url
        
        # If it's just a key, generate presigned URL
        try:
            return generate_presigned_get_url(image_url, expires_in=3600)
        except:
            return image_url

    class Config:
        from_attributes = True

class FoodScanWithItems(FoodScan):
    scan_items: List['FoodScanItem'] = []

# Food Scan Item schemas
class FoodScanItemBase(BaseModel):
    food_item_id: int
    quantity: float
    quantity_unit: str = 'g'
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0

class FoodScanItemCreate(FoodScanItemBase):
    scan_id: int

class FoodScanItem(FoodScanItemBase):
    id: int
    scan_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Nutrition Goal schemas
class NutritionGoalBase(BaseModel):
    date: date
    calories_goal: float = 2000
    protein_goal_g: float = 50
    carbs_goal_g: float = 250
    fat_goal_g: float = 65
    fiber_goal_g: float = 25
    sodium_limit_mg: float = 2300

class NutritionGoalCreate(NutritionGoalBase):
    pass

class NutritionGoalUpdate(BaseModel):
    calories_goal: Optional[float] = None
    protein_goal_g: Optional[float] = None
    carbs_goal_g: Optional[float] = None
    fat_goal_g: Optional[float] = None
    fiber_goal_g: Optional[float] = None
    sodium_limit_mg: Optional[float] = None

class NutritionGoal(NutritionGoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Request/Response schemas
class FoodScanRequest(BaseModel):
    image_key: str
    meal_type: Optional[str] = None
    notes: Optional[str] = None

class FoodScanResponse(BaseModel):
    scan: FoodScan
    analysis: FoodAnalysisResult
    message: str

# Daily Nutrition Summary
class DailyNutritionSummary(BaseModel):
    date: date
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    total_sugar_g: float
    total_sodium_mg: float
    meals_count: int
    goals: Optional[NutritionGoal] = None
    goal_progress: Optional[dict] = None
