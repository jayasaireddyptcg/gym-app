from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional

class StepDataBase(BaseModel):
    steps: int = Field(..., ge=0)
    distance: float = Field(..., ge=0)
    calories: int = Field(..., ge=0)
    flights: int = Field(..., ge=0)
    date: date

class StepDataCreate(StepDataBase):
    pass

class StepGoalBase(BaseModel):
    step_goal: int = Field(..., ge=1, le=100000)

class StepGoalCreate(StepGoalBase):
    date: date

class StepGoal(StepGoalBase):
    id: int
    user_id: int
    date: date
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DailyStepSummaryBase(BaseModel):
    total_steps: int
    total_distance: float
    total_calories: int
    total_flights: int
    step_goal: int
    goal_progress: float
    is_goal_achieved: bool

class DailyStepSummary(DailyStepSummaryBase):
    id: int
    user_id: int
    date: date
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StepHistoryBase(BaseModel):
    steps: int
    distance: float
    calories: int
    flights: int
    recorded_at: datetime
    date: date

class StepHistory(StepHistoryBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class WeeklyStepStats(BaseModel):
    weekly_data: List[DailyStepSummary]
    total_weekly_steps: int
    avg_daily_steps: int
    total_distance: float
    total_calories: int
    goals_achieved: int
