"""
Pydantic schemas for API request/response models
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Base schemas
class UserBase(BaseModel):
    username: str
    role: str


class GrantBase(BaseModel):
    name: str
    total_amount: float
    rules_text: str


class ExpenseBase(BaseModel):
    description: str
    amount: float
    grant_id: int
    submitter_id: int


class ApprovalBase(BaseModel):
    expense_id: int
    approver_id: int


class PaymentBase(BaseModel):
    expense_id: int
    amount: float
    payment_method: str
    payment_reference: Optional[str] = None


# Create schemas
class UserCreate(UserBase):
    pass


class GrantCreate(GrantBase):
    pass


class ExpenseCreate(ExpenseBase):
    ai_compliance_check: Optional[dict] = None


class ApprovalCreate(ApprovalBase):
    pass


class PaymentCreate(PaymentBase):
    pass


# Response schemas
class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class Grant(GrantBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class GrantWithExpenses(Grant):
    expenses: List[dict] = []


class Expense(ExpenseBase):
    id: int
    status: str
    ai_compliance_check: Optional[dict] = None
    created_at: datetime
    grant: Optional[dict] = None  # Populated with {id, name} for API responses
    submitter: Optional[dict] = None  # Populated with {id, username} for API responses
    
    class Config:
        from_attributes = True


class Approval(ApprovalBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class Payment(PaymentBase):
    id: int
    status: str
    processed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Special request schemas
class ComplianceCheckRequest(BaseModel):
    grant_rules: str
    expense_description: str
    expense_amount: float


class ComplianceCheckResponse(BaseModel):
    is_compliant: bool
    justification: str


# Grant Proposal Schemas
class GrantProposalBase(BaseModel):
    title: str
    description: str
    requested_amount: float
    organization_name: str
    contact_email: str
    proposal_type: str


class GrantProposalCreate(GrantProposalBase):
    pass


class GrantProposal(GrantProposalBase):
    id: int
    status: str
    ai_compliance_score: float
    ai_compliance_notes: Optional[str] = None
    reviewer_id: Optional[int] = None
    reviewed_at: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class ProposalReviewRequest(BaseModel):
    proposal_id: int
    reviewer_id: int
    decision: str  # approved, rejected
    review_notes: Optional[str] = None
