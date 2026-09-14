from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.savings_goal import SavingsGoal
from schemas.savings_goal import SavingsGoalCreate, SavingsGoalResponse


router = APIRouter(
    prefix="/savings-goals",
    tags=["Savings Goals"]
)


@router.post("/", response_model=SavingsGoalResponse)
def create_savings_goal(
    goal: SavingsGoalCreate,
    db: Session = Depends(get_db)
):
    new_goal = SavingsGoal(
        user_id=goal.user_id,
        goal_name=goal.goal_name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


@router.get("/", response_model=list[SavingsGoalResponse])
def get_savings_goals(
    db: Session = Depends(get_db)
):
    return db.query(SavingsGoal).all()