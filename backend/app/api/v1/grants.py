"""
Grant API endpoints
"""
from typing import List

from app.core.database import get_db
from app.models.database import Grant as GrantModel
from app.models.schemas import Grant, GrantCreate, GrantWithExpenses
from app.services.gemini_service import gemini_service
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


@router.post("/{grant_id}/review-proposal")
async def review_grant_proposal(
    grant_id: int,
    proposal_text: str,
    proposal_amount: float,
    db: Session = Depends(get_db)
):
    """AI Co-Pilot: Review a grant proposal for compliance"""
    try:
        # Get the grant and its rules
        grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Get AI review
        review = gemini_service.review_grant_proposal(
            grant.rules_text,
            proposal_text,
            proposal_amount
        )
        
        return review
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal review failed: {str(e)}")
