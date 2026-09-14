from pydantic import BaseModel
from datetime import datetime


class RecentTransaction(BaseModel):
    type: str
    amount: float
    category_or_source: str
    date: datetime
    description: str | None = None


class DashboardResponse(BaseModel):
    total_income: float
    total_expenses: float
    remaining_balance: float
    category_wise_expenses: dict[str, float]
    recent_transactions: list[RecentTransaction]