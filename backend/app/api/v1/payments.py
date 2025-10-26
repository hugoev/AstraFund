"""
Payment API endpoints
"""
import uuid
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.database import Expense as ExpenseModel
from app.models.database import Payment as PaymentModel
from app.models.schemas import Payment, PaymentCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=Payment)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Create a new payment for an approved expense"""
    # Verify expense exists and is approved
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == payment.expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense.status != "approved":
        raise HTTPException(status_code=400, detail="Expense must be approved before payment")
    
    # Generate payment reference
    payment_reference = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    
    # Create payment (exclude payment_reference from dict to set it explicitly)
    payment_data = payment.dict(exclude={'payment_reference'})
    db_payment = PaymentModel(
        **payment_data,
        payment_reference=payment_reference,
        status="pending"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return {
        "id": db_payment.id,
        "expense_id": db_payment.expense_id,
        "amount": db_payment.amount,
        "payment_method": db_payment.payment_method,
        "payment_reference": db_payment.payment_reference,
        "status": db_payment.status,
        "processed_at": db_payment.processed_at,
        "created_at": db_payment.created_at
    }


@router.get("/", response_model=List[Payment])
def get_payments(db: Session = Depends(get_db)):
    """Get all payments ordered by status (pending first) and creation date (newest first)"""
    payments = db.query(PaymentModel).order_by(
        # Pending payments first, then by status
        PaymentModel.status == "pending",
        PaymentModel.status,
        # Within each status group, newest first
        PaymentModel.created_at.desc()
    ).all()
    return [
        {
            "id": payment.id,
            "expense_id": payment.expense_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_reference": payment.payment_reference,
            "status": payment.status,
            "processed_at": payment.processed_at,
            "created_at": payment.created_at
        }
        for payment in payments
    ]


@router.get("/expense/{expense_id}", response_model=List[Payment])
def get_expense_payments(expense_id: int, db: Session = Depends(get_db)):
    """Get all payments for a specific expense ordered by status and creation date"""
    payments = db.query(PaymentModel).filter(PaymentModel.expense_id == expense_id).order_by(
        # Pending payments first, then by status
        PaymentModel.status == "pending",
        PaymentModel.status,
        # Within each status group, newest first
        PaymentModel.created_at.desc()
    ).all()
    return [
        {
            "id": payment.id,
            "expense_id": payment.expense_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_reference": payment.payment_reference,
            "status": payment.status,
            "processed_at": payment.processed_at,
            "created_at": payment.created_at
        }
        for payment in payments
    ]


@router.post("/{payment_id}/process")
def process_payment(payment_id: int, db: Session = Depends(get_db)):
    """Process a pending payment (mock payment processing)"""
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status != "pending":
        raise HTTPException(status_code=400, detail="Payment is not in pending status")
    
    # Mock payment processing - simulate success/failure
    import random
    success = random.random() > 0.1  # 90% success rate
    
    if success:
        payment.status = "completed"
        payment.processed_at = datetime.utcnow()
        
        # Update expense status to paid
        expense = db.query(ExpenseModel).filter(ExpenseModel.id == payment.expense_id).first()
        if expense:
            expense.status = "paid"
    else:
        payment.status = "failed"
        payment.processed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": f"Payment {'completed' if success else 'failed'} successfully",
        "status": payment.status,
        "payment_reference": payment.payment_reference
    }


@router.post("/{payment_id}/cancel")
def cancel_payment(payment_id: int, db: Session = Depends(get_db)):
    """Cancel a pending payment"""
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status not in ["pending"]:
        raise HTTPException(status_code=400, detail="Only pending payments can be cancelled")
    
    payment.status = "cancelled"
    payment.processed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Payment cancelled successfully"}


@router.get("/pending", response_model=List[Payment])
def get_pending_payments(db: Session = Depends(get_db)):
    """Get all pending payments"""
    payments = db.query(PaymentModel).filter(PaymentModel.status == "pending").all()
    return [
        {
            "id": payment.id,
            "expense_id": payment.expense_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_reference": payment.payment_reference,
            "status": payment.status,
            "processed_at": payment.processed_at,
            "created_at": payment.created_at
        }
        for payment in payments
    ]
