"""
Expense API endpoints
"""
from typing import Dict, List

from app.core.database import get_db
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.models.schemas import Expense, ExpenseCreate
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/grants/{grant_id}/expenses", response_model=Expense)
def create_expense(grant_id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense for a grant"""
    # Verify grant exists
    grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    db_expense = ExpenseModel(**expense.dict(), grant_id=grant_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {
        "id": db_expense.id,
        "description": db_expense.description,
        "amount": db_expense.amount,
        "grant_id": db_expense.grant_id,
        "submitter_id": db_expense.submitter_id,
        "status": db_expense.status,
        "ai_compliance_check": db_expense.ai_compliance_check,
        "created_at": db_expense.created_at
    }


@router.get("/", response_model=List[Expense])
def get_all_expenses(db: Session = Depends(get_db)):
    """Get all expenses"""
    expenses = db.query(ExpenseModel).all()
    return [
        {
            "id": expense.id,
            "description": expense.description,
            "amount": expense.amount,
            "grant_id": expense.grant_id,
            "submitter_id": expense.submitter_id,
            "status": expense.status,
            "ai_compliance_check": expense.ai_compliance_check,
            "created_at": expense.created_at
        }
        for expense in expenses
    ]


@router.get("/queue", response_model=List[Expense])
def get_pending_expenses(db: Session = Depends(get_db)):
    """Get all pending expenses for approval"""
    expenses = db.query(ExpenseModel).filter(ExpenseModel.status == "pending").all()
    return [
        {
            "id": expense.id,
            "description": expense.description,
            "amount": expense.amount,
            "grant_id": expense.grant_id,
            "submitter_id": expense.submitter_id,
            "status": expense.status,
            "ai_compliance_check": expense.ai_compliance_check,
            "created_at": expense.created_at
        }
        for expense in expenses
    ]


@router.post("/{expense_id}/approve")
def approve_expense(expense_id: int, approver_id: int, db: Session = Depends(get_db)):
    """Approve an expense"""
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "approved"
    db.commit()
    return {"message": "Expense approved successfully"}


@router.post("/{expense_id}/reject")
def reject_expense(expense_id: int, approver_id: int, db: Session = Depends(get_db)):
    """Reject an expense"""
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "rejected"
    db.commit()
    return {"message": "Expense rejected successfully"}


@router.post("/copilot/suggest-allocation")
async def suggest_expense_allocation(
    expense_description: str,
    expense_amount: float,
    db: Session = Depends(get_db)
):
    """AI Co-Pilot: Suggest the best grant allocation for an expense"""
    try:
        # Get all available grants with their rules and remaining amounts
        grants = db.query(GrantModel).all()
        
        grants_data = []
        for grant in grants:
            # Calculate remaining amount (simplified - in real app, subtract approved expenses)
            grants_data.append({
                "id": grant.id,
                "name": grant.name,
                "rules_text": grant.rules_text,
                "remaining_amount": grant.total_amount  # Simplified for demo
            })
        
        # Get AI suggestion
        suggestion = gemini_service.suggest_expense_allocation(
            expense_description, 
            expense_amount, 
            grants_data
        )
        
        return suggestion
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Co-pilot analysis failed: {str(e)}")
