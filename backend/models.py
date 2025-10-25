from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# User models
class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Grant models
class GrantBase(BaseModel):
    name: str
    total_amount: float
    rules_text: str

class GrantCreate(GrantBase):
    pass

class Grant(GrantBase):
    id: int
    
    class Config:
        from_attributes = True

class GrantWithExpenses(Grant):
    expenses: List['Expense'] = []

# Expense models
class ExpenseBase(BaseModel):
    description: str
    amount: float
    grant_id: int
    submitter_id: int

class ExpenseCreate(ExpenseBase):
    ai_compliance_check: Optional[dict] = None

class Expense(ExpenseBase):
    id: int
    status: str
    ai_compliance_check: Optional[dict] = None
    
    class Config:
        from_attributes = True

# Approval models
class ApprovalBase(BaseModel):
    expense_id: int
    approver_id: int

class ApprovalCreate(ApprovalBase):
    pass

class Approval(ApprovalBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Compliance check models
class ComplianceCheckRequest(BaseModel):
    grant_rules: str
    expense_description: str
    expense_amount: float

class ComplianceCheckResponse(BaseModel):
    is_compliant: bool
    justification: str
