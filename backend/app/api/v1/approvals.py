"""
Approval API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Approval as ApprovalModel
from app.models.database import Expense as ExpenseModel
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
    return {
        "id": db_approval.id,
        "expense_id": db_approval.expense_id,
        "approver_id": db_approval.approver_id,
        "timestamp": db_approval.timestamp
    }


@router.get("/", response_model=List[Approval])
def get_approvals(db: Session = Depends(get_db)):
    """Get all approvals"""
    approvals = db.query(ApprovalModel).all()
    return [
        {
            "id": approval.id,
            "expense_id": approval.expense_id,
            "approver_id": approval.approver_id,
            "timestamp": approval.timestamp
        }
        for approval in approvals
    ]


@router.get("/expense/{expense_id}", response_model=List[Approval])
def get_expense_approvals(expense_id: int, db: Session = Depends(get_db)):
    """Get all approvals for a specific expense"""
    approvals = db.query(ApprovalModel).filter(ApprovalModel.expense_id == expense_id).all()
    return [
        {
            "id": approval.id,
            "expense_id": approval.expense_id,
            "approver_id": approval.approver_id,
            "timestamp": approval.timestamp
        }
        for approval in approvals
    ]
