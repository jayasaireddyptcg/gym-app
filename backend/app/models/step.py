from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class StepGoal(Base):
    __tablename__ = "step_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    step_goal = Column(Integer, nullable=False, default=10000)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="step_goals")

class DailyStepSummary(Base):
    __tablename__ = "daily_step_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    total_steps = Column(Integer, nullable=False, default=0)
    total_distance = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    total_calories = Column(Integer, nullable=False, default=0)
    total_flights = Column(Integer, nullable=False, default=0)
    step_goal = Column(Integer, nullable=False, default=10000)
    goal_progress = Column(DECIMAL(5, 2), nullable=False, default=0.00)
    is_goal_achieved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="step_summaries")

class StepHistory(Base):
    __tablename__ = "step_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    steps = Column(Integer, nullable=False)
    distance = Column(DECIMAL(10, 2), nullable=False)
    calories = Column(Integer, nullable=False)
    flights = Column(Integer, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    date = Column(Date, nullable=False)
    
    user = relationship("User", back_populates="step_history")
