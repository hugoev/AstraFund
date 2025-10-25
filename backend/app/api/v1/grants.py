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
    return db_grant


@router.get("/", response_model=List[Grant])
def get_grants(db: Session = Depends(get_db)):
    """Get all grants"""
    return db.query(GrantModel).all()


@router.get("/{grant_id}", response_model=GrantWithExpenses)
def get_grant(grant_id: int, db: Session = Depends(get_db)):
    """Get a specific grant with expenses"""
    grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant
