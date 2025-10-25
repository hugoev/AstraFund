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


# Create schemas
class UserCreate(UserBase):
    pass


class GrantCreate(GrantBase):
    pass


class ExpenseCreate(ExpenseBase):
    ai_compliance_check: Optional[dict] = None


class ApprovalCreate(ApprovalBase):
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
    
    class Config:
        from_attributes = True


class Approval(ApprovalBase):
    id: int
    timestamp: datetime
    
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
