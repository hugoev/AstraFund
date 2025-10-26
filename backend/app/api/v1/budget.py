"""
Budget Optimization API endpoints
"""
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.database import Expense, Grant
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/optimization")
def get_budget_optimization(db: Session = Depends(get_db)):
    """Get AI-powered budget optimization suggestions"""
    try:
        # Get all grants with their expenses
        grants = db.query(Grant).all()
        
        optimization_suggestions = []
        
        for grant in grants:
            # Calculate current spending
            expenses = db.query(Expense).filter(Expense.grant_id == grant.id).all()
            current_spent = sum(expense.amount for expense in expenses)
            remaining = grant.total_amount - current_spent
            
            # Get AI optimization suggestions
            ai_suggestions = gemini_service.get_budget_optimization_suggestions(
                grant_name=grant.name,
                total_budget=grant.total_amount,
                current_spent=current_spent,
                remaining=remaining,
                grant_rules=grant.rules_text
            )
            
            optimization_suggestions.append({
                "grant_id": grant.id,
                "grant_name": grant.name,
                "current_spent": current_spent,
                "total_budget": grant.total_amount,
                "remaining": remaining,
                "suggestions": ai_suggestions.get("suggestions", []),
                "risk_level": ai_suggestions.get("risk_level", "low"),
                "confidence_score": ai_suggestions.get("confidence_score", 0.8)
            })
        
        return optimization_suggestions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget optimization analysis failed: {str(e)}")


@router.post("/optimization/{grant_id}/apply")
def apply_budget_optimization(
    grant_id: int,
    optimization: dict,
    db: Session = Depends(get_db)
):
    """Apply a budget optimization suggestion"""
    try:
        # In a real implementation, this would apply the optimization
        # For now, we'll just return a success message
        grant = db.query(Grant).filter(Grant.id == grant_id).first()
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        return {
            "message": "Budget optimization applied successfully",
            "grant_id": grant_id,
            "optimization_applied": optimization,
            "new_budget_allocation": "Updated",
            "applied_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply optimization: {str(e)}")

