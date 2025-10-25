from typing import List

import uvicorn
from database import Approval, Expense, Grant, User, get_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gemini_service import check_compliance
from models import Approval as ApprovalModel
from models import (ApprovalCreate, ComplianceCheckRequest,
                    ComplianceCheckResponse)
from models import Expense as ExpenseModel
from models import ExpenseCreate
from models import Grant as GrantModel
from models import GrantCreate, GrantWithExpenses
from models import User as UserModel
from models import UserCreate
from sqlalchemy.orm import Session

app = FastAPI(title="AstraFund API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User endpoints
@app.post("/users", response_model=UserModel)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(username=user.username, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users", response_model=List[UserModel])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Grant endpoints
@app.post("/grants", response_model=GrantModel)
def create_grant(grant: GrantCreate, db: Session = Depends(get_db)):
    db_grant = Grant(
        name=grant.name,
        total_amount=grant.total_amount,
        rules_text=grant.rules_text
    )
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return db_grant

@app.get("/grants", response_model=List[GrantModel])
def get_grants(db: Session = Depends(get_db)):
    return db.query(Grant).all()

@app.get("/grants/{grant_id}", response_model=GrantWithExpenses)
def get_grant(grant_id: int, db: Session = Depends(get_db)):
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant

@app.post("/grants/{grant_id}/expenses", response_model=ExpenseModel)
def create_expense(grant_id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    # Verify grant exists
    grant = db.query(Grant).filter(Grant.id == grant_id).first()
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    db_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        grant_id=grant_id,
        submitter_id=expense.submitter_id,
        ai_compliance_check=expense.ai_compliance_check
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# Expense endpoints
@app.get("/expenses/queue", response_model=List[ExpenseModel])
def get_pending_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).filter(Expense.status == "pending").all()

@app.post("/expenses/{expense_id}/approve", response_model=ApprovalModel)
def approve_expense(expense_id: int, approver_id: int, db: Session = Depends(get_db)):
    # Verify expense exists
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Create approval record
    approval = Approval(expense_id=expense_id, approver_id=approver_id)
    db.add(approval)
    
    # Update expense status to approved
    expense.status = "approved"
    
    db.commit()
    db.refresh(approval)
    return approval

# Gemini compliance check endpoint
@app.post("/check_compliance", response_model=ComplianceCheckResponse)
def check_expense_compliance(request: ComplianceCheckRequest):
    result = check_compliance(
        grant_rules=request.grant_rules,
        expense_description=request.expense_description,
        expense_amount=request.expense_amount
    )
    return ComplianceCheckResponse(**result)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
