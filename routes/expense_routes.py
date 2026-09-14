from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.expense import Expense
from schemas.expense import ExpenseCreate, ExpenseResponse
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = Expense(
        user_id=current_user.user_id,
        amount=expense.amount,
        category=expense.category,
        description=expense.description
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Expense).filter(
        Expense.user_id == current_user.user_id
    ).order_by(
        Expense.expense_date.desc()
    ).all()


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_expense = db.query(Expense).filter(
        Expense.expense_id == expense_id,
        Expense.user_id == current_user.user_id
    ).first()

    if not existing_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    existing_expense.amount = expense.amount
    existing_expense.category = expense.category
    existing_expense.description = expense.description

    db.commit()
    db.refresh(existing_expense)

    return existing_expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_expense = db.query(Expense).filter(
        Expense.expense_id == expense_id,
        Expense.user_id == current_user.user_id
    ).first()

    if not existing_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(existing_expense)
    db.commit()

    return {"message": "Expense deleted successfully"}