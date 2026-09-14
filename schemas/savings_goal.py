from pydantic import BaseModel
from datetime import datetime


class SavingsGoalCreate(BaseModel):
    user_id: int
    goal_name: str
    target_amount: float
    current_amount: float = 0
    target_date: datetime | None = None


class SavingsGoalResponse(SavingsGoalCreate):
    goal_id: int

    class Config:
        from_attributes = True