"""
Analytics API endpoints
"""
from datetime import datetime, timedelta
from typing import Dict, List

from app.core.database import get_db
from app.models.database import Approval as ApprovalModel
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.models.database import Payment as PaymentModel
from app.models.database import User as UserModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Get comprehensive analytics overview"""
    try:
        # Basic counts
        total_grants = db.query(GrantModel).count()
        total_users = db.query(UserModel).count()
        total_expenses = db.query(ExpenseModel).count()
        total_payments = db.query(PaymentModel).count()
        
        # Expense status breakdown
        expense_statuses = db.query(
            ExpenseModel.status,
            func.count(ExpenseModel.id).label('count')
        ).group_by(ExpenseModel.status).all()
        
        expense_status_breakdown = {status: count for status, count in expense_statuses}
        
        # Payment status breakdown
        payment_statuses = db.query(
            PaymentModel.status,
            func.count(PaymentModel.id).label('count')
        ).group_by(PaymentModel.status).all()
        
        payment_status_breakdown = {status: count for status, count in payment_statuses}
        
        # Financial metrics
        total_grant_amount = db.query(func.sum(GrantModel.total_amount)).scalar() or 0
        total_spent = db.query(func.sum(PaymentModel.amount)).filter(
            PaymentModel.status == 'completed'
        ).scalar() or 0
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_expenses = db.query(ExpenseModel).filter(
            ExpenseModel.created_at >= thirty_days_ago
        ).count()
        
        recent_payments = db.query(PaymentModel).filter(
            PaymentModel.created_at >= thirty_days_ago
        ).count()
        
        # Average expense amount
        avg_expense_amount = db.query(func.avg(ExpenseModel.amount)).scalar() or 0
        
        # Average payment amount
        avg_payment_amount = db.query(func.avg(PaymentModel.amount)).scalar() or 0
        
        # Compliance metrics
        expenses_with_ai_check = db.query(ExpenseModel).filter(
            ExpenseModel.ai_compliance_check.isnot(None)
        ).count()
        
        compliance_rate = (expenses_with_ai_check / total_expenses * 100) if total_expenses > 0 else 0
        
        return {
            "overview": {
                "total_grants": total_grants,
                "total_users": total_users,
                "total_expenses": total_expenses,
                "total_payments": total_payments,
                "total_grant_amount": float(total_grant_amount),
                "total_spent": float(total_spent),
                "remaining_budget": float(total_grant_amount - total_spent),
                "recent_expenses": recent_expenses,
                "recent_payments": recent_payments,
                "avg_expense_amount": float(avg_expense_amount),
                "avg_payment_amount": float(avg_payment_amount),
                "compliance_rate": round(compliance_rate, 2)
            },
            "expense_breakdown": expense_status_breakdown,
            "payment_breakdown": payment_status_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


@router.get("/trends")
def get_analytics_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get analytics trends over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Daily expense trends
        daily_expenses = db.query(
            func.date(ExpenseModel.created_at).label('date'),
            func.count(ExpenseModel.id).label('count'),
            func.sum(ExpenseModel.amount).label('total_amount')
        ).filter(
            ExpenseModel.created_at >= start_date,
            ExpenseModel.created_at <= end_date
        ).group_by(
            func.date(ExpenseModel.created_at)
        ).order_by('date').all()
        
        # Daily payment trends
        daily_payments = db.query(
            func.date(PaymentModel.created_at).label('date'),
            func.count(PaymentModel.id).label('count'),
            func.sum(PaymentModel.amount).label('total_amount')
        ).filter(
            PaymentModel.created_at >= start_date,
            PaymentModel.created_at <= end_date
        ).group_by(
            func.date(PaymentModel.created_at)
        ).order_by('date').all()
        
        # Format data for frontend
        expense_trends = [
            {
                "date": str(date),
                "count": count,
                "total_amount": float(total_amount or 0)
            }
            for date, count, total_amount in daily_expenses
        ]
        
        payment_trends = [
            {
                "date": str(date),
                "count": count,
                "total_amount": float(total_amount or 0)
            }
            for date, count, total_amount in daily_payments
        ]
        
        return {
            "expense_trends": expense_trends,
            "payment_trends": payment_trends,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trends: {str(e)}")


@router.get("/grants/{grant_id}/analytics")
def get_grant_analytics(grant_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific grant"""
    try:
        grant = db.query(GrantModel).filter(GrantModel.id == grant_id).first()
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        
        # Grant expenses
        grant_expenses = db.query(ExpenseModel).filter(
            ExpenseModel.grant_id == grant_id
        ).all()
        
        # Grant payments
        grant_payments = db.query(PaymentModel).join(ExpenseModel).filter(
            ExpenseModel.grant_id == grant_id
        ).all()
        
        # Calculate metrics
        total_expenses = len(grant_expenses)
        total_spent = sum(p.amount for p in grant_payments if p.status == 'completed')
        remaining_budget = grant.total_amount - total_spent
        
        # Expense status breakdown
        expense_statuses = {}
        for expense in grant_expenses:
            status = expense.status
            expense_statuses[status] = expense_statuses.get(status, 0) + 1
        
        # Payment status breakdown
        payment_statuses = {}
        for payment in grant_payments:
            status = payment.status
            payment_statuses[status] = payment_statuses.get(status, 0) + 1
        
        return {
            "grant": {
                "id": grant.id,
                "name": grant.name,
                "total_amount": grant.total_amount,
                "remaining_budget": remaining_budget,
                "utilization_percentage": (total_spent / grant.total_amount * 100) if grant.total_amount > 0 else 0
            },
            "expenses": {
                "total": total_expenses,
                "status_breakdown": expense_statuses
            },
            "payments": {
                "total": len(grant_payments),
                "total_amount": total_spent,
                "status_breakdown": payment_statuses
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch grant analytics: {str(e)}")


@router.get("/users/{user_id}/analytics")
def get_user_analytics(user_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific user"""
    try:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # User's submitted expenses
        user_expenses = db.query(ExpenseModel).filter(
            ExpenseModel.submitter_id == user_id
        ).all()
        
        # User's approvals
        user_approvals = db.query(ApprovalModel).filter(
            ApprovalModel.approver_id == user_id
        ).all()
        
        # Calculate metrics
        total_submitted = len(user_expenses)
        total_approved = len([e for e in user_expenses if e.status == 'approved'])
        total_rejected = len([e for e in user_expenses if e.status == 'rejected'])
        total_pending = len([e for e in user_expenses if e.status == 'pending'])
        
        total_approvals_given = len(user_approvals)
        
        # Total amount submitted
        total_amount_submitted = sum(e.amount for e in user_expenses)
        
        return {
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            },
            "submitted_expenses": {
                "total": total_submitted,
                "approved": total_approved,
                "rejected": total_rejected,
                "pending": total_pending,
                "total_amount": total_amount_submitted,
                "approval_rate": (total_approved / total_submitted * 100) if total_submitted > 0 else 0
            },
            "approvals_given": total_approvals_given
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user analytics: {str(e)}")
