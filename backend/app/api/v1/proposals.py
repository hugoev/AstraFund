"""
Grant Proposal API endpoints
"""
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.database import GrantProposal as ProposalModel
from app.models.schemas import (GrantProposal, GrantProposalCreate,
                                ProposalReviewRequest)
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[GrantProposal])
def get_proposals(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all grant proposals with optional filtering"""
    query = db.query(ProposalModel)
    
    if status:
        query = query.filter(ProposalModel.status == status)
    
    proposals = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "requested_amount": p.requested_amount,
            "organization_name": p.organization_name,
            "contact_email": p.contact_email,
            "proposal_type": p.proposal_type,
            "status": p.status,
            "ai_compliance_score": p.ai_compliance_score,
            "ai_compliance_notes": p.ai_compliance_notes,
            "reviewer_id": p.reviewer_id,
            "reviewed_at": p.reviewed_at.isoformat() if p.reviewed_at else None,
            "created_at": p.created_at.isoformat()
        }
        for p in proposals
    ]


@router.get("/{proposal_id}", response_model=GrantProposal)
def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    """Get a specific grant proposal"""
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    return {
        "id": proposal.id,
        "title": proposal.title,
        "description": proposal.description,
        "requested_amount": proposal.requested_amount,
        "organization_name": proposal.organization_name,
        "contact_email": proposal.contact_email,
        "proposal_type": proposal.proposal_type,
        "status": proposal.status,
        "ai_compliance_score": proposal.ai_compliance_score,
        "ai_compliance_notes": proposal.ai_compliance_notes,
        "reviewer_id": proposal.reviewer_id,
        "reviewed_at": proposal.reviewed_at.isoformat() if proposal.reviewed_at else None,
        "created_at": proposal.created_at.isoformat()
    }


@router.post("/", response_model=GrantProposal)
def create_proposal(proposal: GrantProposalCreate, db: Session = Depends(get_db)):
    """Create a new grant proposal"""
    db_proposal = ProposalModel(
        title=proposal.title,
        description=proposal.description,
        requested_amount=proposal.requested_amount,
        organization_name=proposal.organization_name,
        contact_email=proposal.contact_email,
        proposal_type=proposal.proposal_type,
        status="pending"
    )
    
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    
    return {
        "id": db_proposal.id,
        "title": db_proposal.title,
        "description": db_proposal.description,
        "requested_amount": db_proposal.requested_amount,
        "organization_name": db_proposal.organization_name,
        "contact_email": db_proposal.contact_email,
        "proposal_type": db_proposal.proposal_type,
        "status": db_proposal.status,
        "ai_compliance_score": db_proposal.ai_compliance_score,
        "ai_compliance_notes": db_proposal.ai_compliance_notes,
        "reviewer_id": db_proposal.reviewer_id,
        "reviewed_at": db_proposal.reviewed_at.isoformat() if db_proposal.reviewed_at else None,
        "created_at": db_proposal.created_at.isoformat()
    }


@router.post("/{proposal_id}/analyze")
def analyze_proposal_compliance(proposal_id: int, db: Session = Depends(get_db)):
    """AI Co-Pilot: Analyze proposal for compliance"""
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    try:
        # Use Gemini to analyze the proposal
        analysis = gemini_service.analyze_proposal_compliance(
            title=proposal.title,
            description=proposal.description,
            requested_amount=proposal.requested_amount,
            proposal_type=proposal.proposal_type
        )
        
        # Update proposal with AI analysis
        proposal.ai_compliance_score = analysis.get("compliance_score", 0.0)
        proposal.ai_compliance_notes = analysis.get("compliance_notes", "")
        proposal.status = "under_review"
        
        db.commit()
        
        return {
            "proposal_id": proposal_id,
            "compliance_score": proposal.ai_compliance_score,
            "compliance_notes": proposal.ai_compliance_notes,
            "recommendation": analysis.get("recommendation", ""),
            "risk_factors": analysis.get("risk_factors", []),
            "strengths": analysis.get("strengths", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@router.post("/{proposal_id}/review")
def review_proposal(
    proposal_id: int,
    review_request: ProposalReviewRequest,
    db: Session = Depends(get_db)
):
    """Review and approve/reject a proposal"""
    proposal = db.query(ProposalModel).filter(ProposalModel.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    proposal.status = review_request.decision
    proposal.reviewer_id = review_request.reviewer_id
    proposal.reviewed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": f"Proposal {review_request.decision} successfully",
        "proposal_id": proposal_id,
        "status": proposal.status,
        "reviewer_id": proposal.reviewer_id,
        "reviewed_at": proposal.reviewed_at.isoformat()
    }


@router.get("/queue/pending", response_model=List[GrantProposal])
def get_pending_proposals(db: Session = Depends(get_db)):
    """Get all pending proposals for review"""
    proposals = db.query(ProposalModel).filter(ProposalModel.status == "pending").all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "requested_amount": p.requested_amount,
            "organization_name": p.organization_name,
            "contact_email": p.contact_email,
            "proposal_type": p.proposal_type,
            "status": p.status,
            "ai_compliance_score": p.ai_compliance_score,
            "ai_compliance_notes": p.ai_compliance_notes,
            "reviewer_id": p.reviewer_id,
            "reviewed_at": p.reviewed_at.isoformat() if p.reviewed_at else None,
            "created_at": p.created_at.isoformat()
        }
        for p in proposals
    ]
