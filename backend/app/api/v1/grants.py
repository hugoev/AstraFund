"""
Grant API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Grant as GrantModel
from app.models.schemas import Grant, GrantCreate, GrantWithExpenses
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
