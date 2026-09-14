from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.income import Income
from models.expense import Expense
from auth.dependencies import get_current_user
from models.user import User

from schemas.dashboard import DashboardResponse, RecentTransaction


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Total Income
    total_income = db.query(
        func.sum(Income.amount)
    ).filter(
        Income.user_id == current_user.user_id
    ).scalar() or 0

    # Total Expenses
    total_expenses = db.query(
        func.sum(Expense.amount)
    ).filter(
        Expense.user_id == current_user.user_id
    ).scalar() or 0

    # Remaining Balance
    remaining_balance = total_income - total_expenses

    # Category-wise Expenses
    category_data = db.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter(
        Expense.user_id == current_user.user_id
    ).group_by(
        Expense.category
    ).all()

    category_wise_expenses = {
        category: float(total)
        for category, total in category_data
    }

    # Recent Expenses
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.user_id
    ).all()

    # Recent Income
    incomes = db.query(Income).filter(
        Income.user_id == current_user.user_id
    ).all()

    transactions = []

    for expense in expenses:
        transactions.append(
            RecentTransaction(
                type="expense",
                amount=expense.amount,
                category_or_source=expense.category,
                date=expense.expense_date,
                description=expense.description
            )
        )

    for income in incomes:
        transactions.append(
            RecentTransaction(
                type="income",
                amount=income.amount,
                category_or_source=income.source,
                date=income.income_date,
                description=income.description
            )
        )

    # Newest transactions first
    transactions.sort(
        key=lambda transaction: transaction.date,
        reverse=True
    )

    # Keep latest 10 transactions
    transactions = transactions[:10]

    return DashboardResponse(
        total_income=float(total_income),
        total_expenses=float(total_expenses),
        remaining_balance=float(remaining_balance),
        category_wise_expenses=category_wise_expenses,
        recent_transactions=transactions
    )