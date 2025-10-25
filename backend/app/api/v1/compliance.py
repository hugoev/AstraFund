"""
Compliance API endpoints
"""
from app.models.schemas import ComplianceCheckRequest, ComplianceCheckResponse
from app.services.gemini_service import gemini_service
from fastapi import APIRouter

router = APIRouter()


@router.post("/check", response_model=ComplianceCheckResponse)
def check_compliance(request: ComplianceCheckRequest):
    """Check if an expense complies with grant rules using AI"""
    result = gemini_service.check_compliance(
        grant_rules=request.grant_rules,
        expense_description=request.expense_description,
        expense_amount=request.expense_amount
    )
    return ComplianceCheckResponse(**result)
