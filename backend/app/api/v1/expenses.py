"""
Expense API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.models.schemas import ApprovalAction, Expense
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


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
            "created_at": expense.created_at,
            "grant": {
                "id": expense.grant.id,
                "name": expense.grant.name
            } if expense.grant else None,
            "submitter": {
                "id": expense.submitter.id,
                "username": expense.submitter.username
            } if expense.submitter else None
        }
        for expense in expenses
    ]


@router.post("/{expense_id}/approve")
def approve_expense(expense_id: int, action: ApprovalAction, db: Session = Depends(get_db)):
    """Approve an expense"""
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "approved"
    db.commit()
    return {"message": "Expense approved successfully", "expense_id": expense_id, "status": "approved"}


@router.post("/{expense_id}/reject")
def reject_expense(expense_id: int, action: ApprovalAction, db: Session = Depends(get_db)):
    """Reject an expense"""
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense.status = "rejected"
    db.commit()
    return {"message": "Expense rejected successfully", "expense_id": expense_id, "status": "rejected"}


@router.post("/auto-approve-compliant")
def auto_approve_compliant(db: Session = Depends(get_db)):
    """Auto-approve all compliant expenses"""
    # Get all pending expenses that are AI-compliant
    compliant_expenses = db.query(ExpenseModel).filter(
        ExpenseModel.status == "pending",
        ExpenseModel.ai_compliance_check["is_compliant"] == True
    ).all()
    
    approved_count = 0
    for expense in compliant_expenses:
        # Update expense status
        expense.status = "approved"
        approved_count += 1
    
    db.commit()
    
    return {
        "message": f"Auto-approved {approved_count} compliant expenses",
        "approved_count": approved_count
    }


from pydantic import BaseModel


class ExpenseAllocationRequest(BaseModel):
    expense_description: str
    expense_amount: float

@router.post("/copilot/suggest-allocation")
async def suggest_expense_allocation(
    request: ExpenseAllocationRequest,
    db: Session = Depends(get_db)
):
    """AI Co-Pilot: Suggest the best grant allocation for an expense"""
    expense_description = request.expense_description
    expense_amount = request.expense_amount
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
