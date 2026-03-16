from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, datetime, timedelta
from typing import List, Optional

from app.ai.food_predictor import predict_food_nutrition
from app.services.s3 import load_image_from_s3
from app.core.config import settings
from app.models.food import FoodScan, FoodScanItem, FoodItem, NutritionGoal
from app.models.user import User
from app.schemas.food import (
    FoodScanCreate, FoodAnalysisResult, FoodScanResponse,
    NutritionGoalCreate, NutritionGoalUpdate, DailyNutritionSummary
)

class FoodService:
    
    def __init__(self, db: Session):
        self.db = db

    async def scan_food(self, user_id: int, image_key: str, meal_type: Optional[str] = None, notes: Optional[str] = None) -> FoodScanResponse:
        """
        Scan food image and save nutritional analysis
        """
        try:
            # Load image from S3
            image = load_image_from_s3(image_key)
            
            # Analyze food using GPT vision model
            analysis = predict_food_nutrition(image)
            
            # Create food scan record
            scan_data = FoodScanCreate(
                image_url=f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{image_key}",
                total_calories=analysis["total_calories"],
                total_protein_g=analysis["total_protein_g"],
                total_carbs_g=analysis["total_carbs_g"],
                total_fat_g=analysis["total_fat_g"],
                total_fiber_g=analysis.get("total_fiber_g", 0),
                total_sugar_g=analysis.get("total_sugar_g", 0),
                total_sodium_mg=analysis.get("total_sodium_mg", 0),
                meal_type=meal_type,
                confidence_score=analysis["confidence"],
                notes=notes
            )
            
            # Create scan record
            db_scan = FoodScan(**scan_data.model_dump(), user_id=user_id)
            self.db.add(db_scan)
            self.db.flush()  # Get the ID without committing
            
            # Create food items and scan items
            for food_data in analysis["foods"]:
                # Find or create food item
                food_item = self._find_or_create_food_item(food_data)
                
                # Create scan item
                scan_item = FoodScanItem(
                    scan_id=db_scan.id,
                    food_item_id=food_item.id,
                    quantity=food_data["quantity_g"],
                    calories=food_data["calories"],
                    protein_g=food_data["protein_g"],
                    carbs_g=food_data["carbs_g"],
                    fat_g=food_data["fat_g"],
                    fiber_g=food_data.get("fiber_g", 0),
                    sugar_g=food_data.get("sugar_g", 0),
                    sodium_mg=food_data.get("sodium_mg", 0)
                )
                self.db.add(scan_item)
            
            self.db.commit()
            self.db.refresh(db_scan)
            
            # Convert to response format
            analysis_result = FoodAnalysisResult(**analysis)
            
            return FoodScanResponse(
                scan=db_scan,
                analysis=analysis_result,
                message="Food scan completed successfully"
            )
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Food scan failed: {str(e)}")

    def _find_or_create_food_item(self, food_data: dict) -> FoodItem:
        """
        Find existing food item or create new one
        """
        # Try to find by name (case-insensitive)
        food_item = self.db.query(FoodItem).filter(
            FoodItem.name.ilike(food_data["name"])
        ).first()
        
        if not food_item:
            # Create new food item
            # Calculate per 100g values
            quantity = food_data["quantity_g"]
            if quantity > 0:
                calories_per_100g = (food_data["calories"] / quantity) * 100
                protein_per_100g = (food_data["protein_g"] / quantity) * 100
                carbs_per_100g = (food_data["carbs_g"] / quantity) * 100
                fat_per_100g = (food_data["fat_g"] / quantity) * 100
                fiber_per_100g = (food_data.get("fiber_g", 0) / quantity) * 100
                sugar_per_100g = (food_data.get("sugar_g", 0) / quantity) * 100
                sodium_per_100g = (food_data.get("sodium_mg", 0) / quantity) * 100
            else:
                calories_per_100g = protein_per_100g = carbs_per_100g = fat_per_100g = 0
                fiber_per_100g = sugar_per_100g = sodium_per_100g = 0
            
            food_item = FoodItem(
                name=food_data["name"],
                category=food_data["category"],
                calories_per_100g=calories_per_100g,
                protein_g=protein_per_100g,
                carbs_g=carbs_per_100g,
                fat_g=fat_per_100g,
                fiber_g=fiber_per_100g,
                sugar_g=sugar_per_100g,
                sodium_mg=sodium_per_100g
            )
            self.db.add(food_item)
            self.db.flush()
        
        return food_item

    def get_user_scans(self, user_id: int, limit: int = 50, offset: int = 0) -> List[FoodScan]:
        """
        Get user's food scans with pagination
        """
        return self.db.query(FoodScan).filter(
            FoodScan.user_id == user_id
        ).order_by(FoodScan.scan_date.desc()).offset(offset).limit(limit).all()

    def get_scan_by_id(self, scan_id: int, user_id: int) -> Optional[FoodScan]:
        """
        Get specific scan with items
        """
        return self.db.query(FoodScan).filter(
            FoodScan.id == scan_id,
            FoodScan.user_id == user_id
        ).first()

    def delete_scan(self, scan_id: int, user_id: int) -> bool:
        """
        Delete a food scan
        """
        scan = self.get_scan_by_id(scan_id, user_id)
        if not scan:
            return False
        
        self.db.delete(scan)
        self.db.commit()
        return True

    def get_daily_nutrition_summary(self, user_id: int, target_date: date) -> DailyNutritionSummary:
        """
        Get daily nutrition summary for a specific date
        """
        # Get all scans for the date
        scans = self.db.query(FoodScan).filter(
            FoodScan.user_id == user_id,
            FoodScan.scan_date >= datetime.combine(target_date, datetime.min.time()),
            FoodScan.scan_date < datetime.combine(target_date + timedelta(days=1), datetime.min.time())
        ).all()
        
        # Calculate totals
        total_calories = sum(scan.total_calories for scan in scans)
        total_protein = sum(scan.total_protein_g for scan in scans)
        total_carbs = sum(scan.total_carbs_g for scan in scans)
        total_fat = sum(scan.total_fat_g for scan in scans)
        total_fiber = sum(scan.total_fiber_g for scan in scans)
        total_sugar = sum(scan.total_sugar_g for scan in scans)
        total_sodium = sum(scan.total_sodium_mg for scan in scans)
        
        # Get goals for the date
        goals = self.db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id,
            NutritionGoal.date == target_date
        ).first()
        
        # Calculate goal progress
        goal_progress = None
        if goals:
            goal_progress = {
                "calories_percent": (total_calories / goals.calories_goal) * 100 if goals.calories_goal > 0 else 0,
                "protein_percent": (total_protein / goals.protein_goal_g) * 100 if goals.protein_goal_g > 0 else 0,
                "carbs_percent": (total_carbs / goals.carbs_goal_g) * 100 if goals.carbs_goal_g > 0 else 0,
                "fat_percent": (total_fat / goals.fat_goal_g) * 100 if goals.fat_goal_g > 0 else 0,
                "fiber_percent": (total_fiber / goals.fiber_goal_g) * 100 if goals.fiber_goal_g > 0 else 0,
                "sodium_percent": (total_sodium / goals.sodium_limit_mg) * 100 if goals.sodium_limit_mg > 0 else 0
            }
        
        return DailyNutritionSummary(
            date=target_date,
            total_calories=total_calories,
            total_protein_g=total_protein,
            total_carbs_g=total_carbs,
            total_fat_g=total_fat,
            total_fiber_g=total_fiber,
            total_sugar_g=total_sugar,
            total_sodium_mg=total_sodium,
            meals_count=len(scans),
            goals=goals,
            goal_progress=goal_progress
        )

    def set_nutrition_goals(self, user_id: int, goals_data: NutritionGoalCreate) -> NutritionGoal:
        """
        Set or update nutrition goals for a specific date
        """
        # Check if goals already exist for the date
        existing_goals = self.db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id,
            NutritionGoal.date == goals_data.date
        ).first()
        
        if existing_goals:
            # Update existing goals
            for field, value in goals_data.model_dump(exclude_unset=True).items():
                setattr(existing_goals, field, value)
            self.db.commit()
            self.db.refresh(existing_goals)
            return existing_goals
        else:
            # Create new goals
            new_goals = NutritionGoal(**goals_data.model_dump(), user_id=user_id)
            self.db.add(new_goals)
            self.db.commit()
            self.db.refresh(new_goals)
            return new_goals

    def get_nutrition_goals(self, user_id: int, target_date: date) -> Optional[NutritionGoal]:
        """
        Get nutrition goals for a specific date
        """
        return self.db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id,
            NutritionGoal.date == target_date
        ).first()

    def search_food_items(self, query: str, limit: int = 20) -> List[FoodItem]:
        """
        Search food items by name or category
        """
        return self.db.query(FoodItem).filter(
            FoodItem.name.ilike(f"%{query}%")
        ).limit(limit).all()
