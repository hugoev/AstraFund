"""
Approval API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Approval as ApprovalModel, Expense as ExpenseModel
from app.models.schemas import Approval, ApprovalCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=Approval)
def create_approval(approval: ApprovalCreate, db: Session = Depends(get_db)):
    """Create a new approval"""
    # Verify expense exists
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == approval.expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db_approval = ApprovalModel(**approval.dict())
    db.add(db_approval)
    db.commit()
    db.refresh(db_approval)
    return db_approval


@router.get("/", response_model=List[Approval])
def get_approvals(db: Session = Depends(get_db)):
    """Get all approvals"""
    return db.query(ApprovalModel).all()


@router.get("/expense/{expense_id}", response_model=List[Approval])
def get_expense_approvals(expense_id: int, db: Session = Depends(get_db)):
    """Get all approvals for a specific expense"""
    return db.query(ApprovalModel).filter(ApprovalModel.expense_id == expense_id).all()
