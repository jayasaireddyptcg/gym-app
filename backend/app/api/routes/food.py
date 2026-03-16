from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid
import os

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.services.food_service import FoodService
from app.services.s3 import upload_file_to_s3
from app.schemas.food import (
    FoodScanRequest, FoodScanResponse, FoodScan, FoodScanWithItems,
    NutritionGoalCreate, NutritionGoal, NutritionGoalUpdate,
    DailyNutritionSummary, FoodItem
)

router = APIRouter(prefix="/food", tags=["Food"])

@router.post("/scan", response_model=FoodScanResponse)
async def scan_food(
    request: FoodScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scan food image and analyze nutritional content
    """
    food_service = FoodService(db)
    return await food_service.scan_food(
        user_id=current_user.id,
        image_key=request.image_key,
        meal_type=request.meal_type,
        notes=request.notes
    )

@router.post("/scan-from-gallery", response_model=FoodScanResponse)
async def scan_food_from_gallery(
    file: UploadFile = File(...),
    meal_type: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scan food image from gallery and analyze nutritional content
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"food-scans/{current_user.id}/{uuid.uuid4()}{file_extension}"
        
        # Upload file to S3
        image_key = await upload_file_to_s3(file, unique_filename)
        
        # Scan food using existing service
        food_service = FoodService(db)
        return await food_service.scan_food(
            user_id=current_user.id,
            image_key=image_key,
            meal_type=meal_type,
            notes=notes
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process gallery image: {str(e)}")

@router.get("/scans", response_model=List[FoodScan])
def get_user_scans(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's food scans with pagination
    """
    food_service = FoodService(db)
    return food_service.get_user_scans(
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )

@router.get("/scans/{scan_id}", response_model=FoodScanWithItems)
def get_scan_details(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific food scan
    """
    food_service = FoodService(db)
    scan = food_service.get_scan_by_id(scan_id, current_user.id)
    
    if not scan:
        raise HTTPException(status_code=404, detail="Food scan not found")
    
    return scan

@router.delete("/scans/{scan_id}")
def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a food scan
    """
    food_service = FoodService(db)
    success = food_service.delete_scan(scan_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Food scan not found")
    
    return {"message": "Food scan deleted successfully"}

@router.get("/daily-summary/{target_date}", response_model=DailyNutritionSummary)
def get_daily_nutrition_summary(
    target_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily nutrition summary for a specific date
    """
    food_service = FoodService(db)
    return food_service.get_daily_nutrition_summary(current_user.id, target_date)

@router.get("/today-summary", response_model=DailyNutritionSummary)
def get_today_nutrition_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's nutrition summary
    """
    food_service = FoodService(db)
    return food_service.get_daily_nutrition_summary(current_user.id, date.today())

@router.post("/goals", response_model=NutritionGoal)
def set_nutrition_goals(
    goals_data: NutritionGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Set or update nutrition goals for a specific date
    """
    food_service = FoodService(db)
    return food_service.set_nutrition_goals(current_user.id, goals_data)

@router.get("/goals/{target_date}", response_model=NutritionGoal)
def get_nutrition_goals(
    target_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get nutrition goals for a specific date
    """
    food_service = FoodService(db)
    goals = food_service.get_nutrition_goals(current_user.id, target_date)
    
    if not goals:
        raise HTTPException(status_code=404, detail="Nutrition goals not found for this date")
    
    return goals

@router.put("/goals/{target_date}", response_model=NutritionGoal)
def update_nutrition_goals(
    target_date: date,
    goals_update: NutritionGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update nutrition goals for a specific date
    """
    food_service = FoodService(db)
    existing_goals = food_service.get_nutrition_goals(current_user.id, target_date)
    
    if not existing_goals:
        raise HTTPException(status_code=404, detail="Nutrition goals not found for this date")
    
    # Update the existing goals
    for field, value in goals_update.model_dump(exclude_unset=True).items():
        setattr(existing_goals, field, value)
    
    db.commit()
    db.refresh(existing_goals)
    return existing_goals

@router.get("/food-items/search", response_model=List[FoodItem])
def search_food_items(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search food items by name
    """
    food_service = FoodService(db)
    return food_service.search_food_items(q, limit)

@router.get("/stats/weekly")
def get_weekly_nutrition_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get weekly nutrition statistics
    """
    from datetime import timedelta
    
    food_service = FoodService(db)
    end_date = date.today()
    start_date = end_date - timedelta(days=6)
    
    weekly_data = []
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        daily_summary = food_service.get_daily_nutrition_summary(current_user.id, current_date)
        weekly_data.append({
            "date": current_date.isoformat(),
            "calories": daily_summary.total_calories,
            "protein": daily_summary.total_protein_g,
            "carbs": daily_summary.total_carbs_g,
            "fat": daily_summary.total_fat_g,
            "meals": daily_summary.meals_count
        })
    
    return {
        "weekly_data": weekly_data,
        "total_weekly_calories": sum(day["calories"] for day in weekly_data),
        "avg_daily_calories": sum(day["calories"] for day in weekly_data) / 7,
        "total_meals": sum(day["meals"] for day in weekly_data)
    }
