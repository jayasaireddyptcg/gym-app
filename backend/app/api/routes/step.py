from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from datetime import date, datetime, timedelta
from typing import List, Optional

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.step import DailyStepSummary, StepGoal as StepGoalModel, StepHistory
from app.schemas.step import (
    StepDataCreate, DailyStepSummary as DailyStepSummarySchema,
    StepGoalCreate, StepGoal, WeeklyStepStats, StepHistory as StepHistorySchema
)

router = APIRouter(prefix="/steps", tags=["steps"])

@router.post("/", response_model=DailyStepSummarySchema)
async def save_step_data(
    step_data: StepDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save or update daily step data"""
    
    # Get or create step goal for the date
    step_goal = db.query(StepGoalModel).filter(
        and_(StepGoalModel.user_id == current_user.id, StepGoalModel.date == step_data.date)
    ).first()
    
    if not step_goal:
        step_goal = StepGoalModel(
            user_id=current_user.id,
            date=step_data.date,
            step_goal=10000  # Default goal
        )
        db.add(step_goal)
        db.commit()
        db.refresh(step_goal)
    
    # Calculate goal progress
    goal_progress = (step_data.steps / step_goal.step_goal) * 100 if step_goal.step_goal > 0 else 0
    is_goal_achieved = step_data.steps >= step_goal.step_goal
    
    # Upsert daily summary
    existing_summary = db.query(DailyStepSummary).filter(
        and_(DailyStepSummary.user_id == current_user.id, DailyStepSummary.date == step_data.date)
    ).first()
    
    if existing_summary:
        # Update with higher values (to handle multiple updates in a day)
        existing_summary.total_steps = max(existing_summary.total_steps, step_data.steps)
        existing_summary.total_distance = max(float(existing_summary.total_distance), step_data.distance)
        existing_summary.total_calories = max(existing_summary.total_calories, step_data.calories)
        existing_summary.total_flights = max(existing_summary.total_flights, step_data.flights)
        existing_summary.step_goal = step_goal.step_goal
        existing_summary.goal_progress = goal_progress
        existing_summary.is_goal_achieved = is_goal_achieved
        existing_summary.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_summary)
        summary = existing_summary
    else:
        # Create new summary
        summary = DailyStepSummary(
            user_id=current_user.id,
            date=step_data.date,
            total_steps=step_data.steps,
            total_distance=step_data.distance,
            total_calories=step_data.calories,
            total_flights=step_data.flights,
            step_goal=step_goal.step_goal,
            goal_progress=goal_progress,
            is_goal_achieved=is_goal_achieved
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
    
    # Add to history for detailed tracking
    history = StepHistory(
        user_id=current_user.id,
        steps=step_data.steps,
        distance=step_data.distance,
        calories=step_data.calories,
        flights=step_data.flights,
        date=step_data.date
    )
    db.add(history)
    db.commit()
    
    return summary

@router.get("/today", response_model=DailyStepSummarySchema)
async def get_today_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's step summary"""
    
    today = date.today()
    summary = db.query(DailyStepSummary).filter(
        and_(DailyStepSummary.user_id == current_user.id, DailyStepSummary.date == today)
    ).first()
    
    if not summary:
        # Get default goal
        step_goal = db.query(StepGoalModel).filter(
            and_(StepGoalModel.user_id == current_user.id, StepGoalModel.date == today)
        ).first()
        
        default_goal = step_goal.step_goal if step_goal else 10000
        
        return DailyStepSummary(
            id=0,
            user_id=current_user.id,
            date=today,
            total_steps=0,
            total_distance=0.0,
            total_calories=0,
            total_flights=0,
            step_goal=default_goal,
            goal_progress=0.0,
            is_goal_achieved=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    return summary

@router.get("/daily/{date}", response_model=DailyStepSummarySchema)
async def get_daily_summary(
    date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get step summary for a specific date"""
    
    summary = db.query(DailyStepSummary).filter(
        and_(DailyStepSummary.user_id == current_user.id, DailyStepSummary.date == date)
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="No step data found for this date")
    
    return summary

@router.get("/history", response_model=List[DailyStepSummarySchema])
async def get_step_history(
    limit: int = Query(30, ge=1, le=365),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get step history with pagination"""
    
    summaries = db.query(DailyStepSummary).filter(
        DailyStepSummary.user_id == current_user.id
    ).order_by(desc(DailyStepSummary.date)).offset(offset).limit(limit).all()
    
    return summaries

@router.post("/goals", response_model=StepGoal)
async def set_step_goal(
    goal_data: StepGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set step goal for a specific date"""
    
    existing_goal = db.query(StepGoalModel).filter(
        and_(StepGoalModel.user_id == current_user.id, StepGoalModel.date == goal_data.date)
    ).first()
    
    if existing_goal:
        existing_goal.step_goal = goal_data.step_goal
        existing_goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_goal)
        return existing_goal
    else:
        new_goal = StepGoalModel(
            user_id=current_user.id,
            date=goal_data.date,
            step_goal=goal_data.step_goal
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return new_goal

@router.get("/goals/{date}", response_model=StepGoal)
async def get_step_goal(
    date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get step goal for a specific date"""
    
    goal = db.query(StepGoalModel).filter(
        and_(StepGoalModel.user_id == current_user.id, StepGoalModel.date == date)
    ).first()
    
    if not goal:
        # Return default goal
        return StepGoal(
            id=0,
            user_id=current_user.id,
            date=date,
            step_goal=10000,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    return goal

@router.get("/stats/weekly", response_model=WeeklyStepStats)
async def get_weekly_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get weekly step statistics"""
    
    # Get last 7 days
    end_date = date.today()
    start_date = end_date - timedelta(days=6)
    
    summaries = db.query(DailyStepSummary).filter(
        and_(
            DailyStepSummary.user_id == current_user.id,
            DailyStepSummary.date >= start_date,
            DailyStepSummary.date <= end_date
        )
    ).order_by(DailyStepSummary.date).all()
    
    # Fill missing days with zeros
    weekly_data = []
    total_steps = 0
    total_distance = 0.0
    total_calories = 0
    goals_achieved = 0
    
    current_date = start_date
    while current_date <= end_date:
        day_summary = next((s for s in summaries if s.date == current_date), None)
        
        if day_summary:
            weekly_data.append(day_summary)
            total_steps += day_summary.total_steps
            total_distance += float(day_summary.total_distance)
            total_calories += day_summary.total_calories
            if day_summary.is_goal_achieved:
                goals_achieved += 1
        else:
            # Create zero entry for missing day
            zero_summary = DailyStepSummary(
                id=0,
                user_id=current_user.id,
                date=current_date,
                total_steps=0,
                total_distance=0.0,
                total_calories=0,
                total_flights=0,
                step_goal=10000,
                goal_progress=0.0,
                is_goal_achieved=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            weekly_data.append(zero_summary)
        
        current_date += timedelta(days=1)
    
    avg_daily_steps = total_steps // 7 if len(weekly_data) > 0 else 0
    
    return WeeklyStepStats(
        weekly_data=weekly_data,
        total_weekly_steps=total_steps,
        avg_daily_steps=avg_daily_steps,
        total_distance=total_distance,
        total_calories=total_calories,
        goals_achieved=goals_achieved
    )
