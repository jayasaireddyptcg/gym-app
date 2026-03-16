from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(100))
    category = Column(String(100), nullable=False, index=True)
    calories_per_100g = Column(Float(8, 2), nullable=False)
    protein_g = Column(Float(6, 2), nullable=False)
    carbs_g = Column(Float(6, 2), nullable=False)
    fat_g = Column(Float(6, 2), nullable=False)
    fiber_g = Column(Float(6, 2), default=0)
    sugar_g = Column(Float(6, 2), default=0)
    sodium_mg = Column(Float(7, 2), default=0)
    cholesterol_mg = Column(Float(6, 2), default=0)
    saturated_fat_g = Column(Float(6, 2), default=0)
    trans_fat_g = Column(Float(6, 2), default=0)
    vitamin_a_mcg = Column(Float(8, 2), default=0)
    vitamin_c_mg = Column(Float(6, 2), default=0)
    calcium_mg = Column(Float(7, 2), default=0)
    iron_mg = Column(Float(6, 2), default=0)
    potassium_mg = Column(Float(7, 2), default=0)
    serving_size = Column(String(50), default='100g')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    scan_items = relationship("FoodScanItem", back_populates="food_item")

class FoodScan(Base):
    __tablename__ = "food_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    scan_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    total_calories = Column(Float(8, 2), nullable=False)
    total_protein_g = Column(Float(6, 2), nullable=False)
    total_carbs_g = Column(Float(6, 2), nullable=False)
    total_fat_g = Column(Float(6, 2), nullable=False)
    total_fiber_g = Column(Float(6, 2), default=0)
    total_sugar_g = Column(Float(6, 2), default=0)
    total_sodium_mg = Column(Float(7, 2), default=0)
    meal_type = Column(String(20))  # breakfast, lunch, dinner, snack
    confidence_score = Column(Float(3, 2), default=0.00)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="food_scans")
    scan_items = relationship("FoodScanItem", back_populates="scan", cascade="all, delete-orphan")

class FoodScanItem(Base):
    __tablename__ = "food_scan_items"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("food_scans.id"), nullable=False, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False, index=True)
    quantity = Column(Float(8, 2), nullable=False)  # in grams
    quantity_unit = Column(String(20), default='g')
    calories = Column(Float(8, 2), nullable=False)
    protein_g = Column(Float(6, 2), nullable=False)
    carbs_g = Column(Float(6, 2), nullable=False)
    fat_g = Column(Float(6, 2), nullable=False)
    fiber_g = Column(Float(6, 2), default=0)
    sugar_g = Column(Float(6, 2), default=0)
    sodium_mg = Column(Float(7, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scan = relationship("FoodScan", back_populates="scan_items")
    food_item = relationship("FoodItem", back_populates="scan_items")

class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    calories_goal = Column(Float(8, 2), default=2000)
    protein_goal_g = Column(Float(6, 2), default=50)
    carbs_goal_g = Column(Float(6, 2), default=250)
    fat_goal_g = Column(Float(6, 2), default=65)
    fiber_goal_g = Column(Float(6, 2), default=25)
    sodium_limit_mg = Column(Float(7, 2), default=2300)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="nutrition_goals")
