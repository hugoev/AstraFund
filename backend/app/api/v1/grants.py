"""
Grant API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.models.schemas import (Expense, ExpenseCreate, Grant, GrantCreate,
                                GrantWithExpenses)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=Grant)
def create_grant(grant: GrantCreate, db: Session = Depends(get_db)):
    """Create a new grant"""
    db_grant = GrantModel(**grant.dict())
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return {
        "id": db_grant.id,
        "name": db_grant.name,
        "total_amount": db_grant.total_amount,
        "rules_text": db_grant.rules_text,
        "created_at": db_grant.created_at
    }


@router.get("/", response_model=List[Grant])
def get_grants(db: Session = Depends(get_db)):
    """Get all grants"""
    grants = db.query(GrantModel).all()
    return [
        {
            "id": grant.id,
            "name": grant.name,
            "total_amount": grant.total_amount,
            "rules_text": grant.rules_text,
            "created_at": grant.created_at
        }
        for grant in grants
    ]


@router.get("/{grant_id}", response_model=GrantWithExpenses)
def get_grant(grant_id: int, db: Session = Depends(get_db)):
    """Get a specific grant with expenses"""
    grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Convert SQLAlchemy objects to dictionaries
    grant_data = {
        "id": grant.id,
        "name": grant.name,
        "total_amount": grant.total_amount,
        "rules_text": grant.rules_text,
        "created_at": grant.created_at,
        "expenses": [
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
            for expense in grant.expenses
        ]
    }
    return grant_data


@router.post("/{grant_id}/expenses", response_model=Expense)
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
