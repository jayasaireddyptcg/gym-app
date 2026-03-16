from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    
    # Food tracking relationships
    food_scans = relationship("FoodScan", back_populates="user")
    nutrition_goals = relationship("NutritionGoal", back_populates="user")
    
    # Step tracking relationships
    step_goals = relationship("StepGoal", back_populates="user")
    step_summaries = relationship("DailyStepSummary", back_populates="user")
    step_history = relationship("StepHistory", back_populates="user")