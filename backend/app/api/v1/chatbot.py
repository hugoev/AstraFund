"""
Chatbot API endpoints for AI-powered analytics insights
"""
from typing import Dict, List, Optional

from app.core.database import get_db
from app.models.database import Approval as ApprovalModel
from app.models.database import Expense as ExpenseModel
from app.models.database import Grant as GrantModel
from app.models.database import Payment as PaymentModel
from app.models.database import User as UserModel
from app.services.gemini_service import gemini_service
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict] = None


class ChatResponse(BaseModel):
    response: str
    insights: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None


def get_analytics_context(db: Session) -> Dict:
    """Get comprehensive analytics context for the chatbot"""
    try:
        # Basic counts
        total_grants = db.query(GrantModel).count()
        total_users = db.query(UserModel).count()
        total_expenses = db.query(ExpenseModel).count()
        total_payments = db.query(PaymentModel).count()
        
        # Financial metrics
        total_grant_amount = db.query(func.sum(GrantModel.total_amount)).scalar() or 0
        total_spent = db.query(func.sum(PaymentModel.amount)).filter(
            PaymentModel.status == 'completed'
        ).scalar() or 0
        
        # Expense status breakdown
        expense_statuses = db.query(
            ExpenseModel.status,
            func.count(ExpenseModel.id).label('count')
        ).group_by(ExpenseModel.status).all()
        
        expense_breakdown = {status: count for status, count in expense_statuses}
        
        # Payment status breakdown
        payment_statuses = db.query(
            PaymentModel.status,
            func.count(PaymentModel.id).label('count')
        ).group_by(PaymentModel.status).all()
        
        payment_breakdown = {status: count for status, count in payment_statuses}
        
        # Recent activity (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_expenses = db.query(ExpenseModel).filter(
            ExpenseModel.created_at >= thirty_days_ago
        ).count()
        
        recent_payments = db.query(PaymentModel).filter(
            PaymentModel.created_at >= thirty_days_ago
        ).count()
        
        # Average amounts
        avg_expense = db.query(func.avg(ExpenseModel.amount)).scalar() or 0
        avg_payment = db.query(func.avg(PaymentModel.amount)).scalar() or 0
        
        # Compliance metrics
        expenses_with_ai = db.query(ExpenseModel).filter(
            ExpenseModel.ai_compliance_check.isnot(None)
        ).count()
        
        compliance_rate = (expenses_with_ai / total_expenses * 100) if total_expenses > 0 else 0
        
        return {
            "total_grants": total_grants,
            "total_users": total_users,
            "total_expenses": total_expenses,
            "total_payments": total_payments,
            "total_grant_amount": float(total_grant_amount),
            "total_spent": float(total_spent),
            "remaining_budget": float(total_grant_amount - total_spent),
            "recent_expenses": recent_expenses,
            "recent_payments": recent_payments,
            "avg_expense_amount": float(avg_expense),
            "avg_payment_amount": float(avg_payment),
            "compliance_rate": round(compliance_rate, 2),
            "expense_breakdown": expense_breakdown,
            "payment_breakdown": payment_breakdown
        }
    except Exception as e:
        return {"error": f"Failed to get analytics context: {str(e)}"}


@router.post("/chat", response_model=ChatResponse)
def chat_with_analytics(message: ChatMessage, db: Session = Depends(get_db)):
    """Chat with AI about analytics insights"""
    try:
        # Get current analytics context
        analytics_context = get_analytics_context(db)
        
        if "error" in analytics_context:
            raise HTTPException(status_code=500, detail=analytics_context["error"])
        
        # Create context-aware prompt for Gemini
        system_prompt = f"""You are an AI analytics assistant for AstraFund, a financial compliance co-pilot for non-profits. 
You have access to the following current analytics data:

ANALYTICS DATA:
- Total Grants: {analytics_context['total_grants']}
- Total Users: {analytics_context['total_users']}
- Total Expenses: {analytics_context['total_expenses']}
- Total Payments: {analytics_context['total_payments']}
- Total Grant Amount: ${analytics_context['total_grant_amount']:,.2f}
- Total Spent: ${analytics_context['total_spent']:,.2f}
- Remaining Budget: ${analytics_context['remaining_budget']:,.2f}
- Recent Expenses (30 days): {analytics_context['recent_expenses']}
- Recent Payments (30 days): {analytics_context['recent_payments']}
- Average Expense Amount: ${analytics_context['avg_expense_amount']:,.2f}
- Average Payment Amount: ${analytics_context['avg_payment_amount']:,.2f}
- Compliance Rate: {analytics_context['compliance_rate']}%

EXPENSE BREAKDOWN:
{', '.join([f"{status}: {count}" for status, count in analytics_context['expense_breakdown'].items()])}

PAYMENT BREAKDOWN:
{', '.join([f"{status}: {count}" for status, count in analytics_context['payment_breakdown'].items()])}

Your role is to:
1. Answer questions about the analytics data
2. Provide insights and trends
3. Suggest improvements or actions
4. Explain patterns in the data
5. Help with grant management decisions

Be conversational, helpful, and provide actionable insights. If asked about specific metrics, use the data above.
If asked about trends or comparisons, make educated inferences based on the available data.
Always be encouraging and focus on how the data can help improve grant management.

Respond in a friendly, professional tone as if you're a data analyst consultant."""

        # Use Gemini to generate response
        response_text = gemini_service.generate_insights(
            user_message=message.message,
            system_prompt=system_prompt,
            analytics_data=analytics_context
        )
        
        # Extract insights and suggestions from the response
        insights = []
        suggestions = []
        
        # Simple parsing to extract insights and suggestions
        if "insight" in response_text.lower() or "pattern" in response_text.lower():
            insights.append("AI has identified patterns in your data")
        
        if "suggest" in response_text.lower() or "recommend" in response_text.lower():
            suggestions.append("AI has provided recommendations")
        
        # Add some default insights based on data
        if analytics_context['compliance_rate'] > 80:
            insights.append("High compliance rate indicates good expense management")
        elif analytics_context['compliance_rate'] < 50:
            insights.append("Low compliance rate suggests need for better expense guidelines")
        
        if analytics_context['remaining_budget'] < analytics_context['total_grant_amount'] * 0.1:
            suggestions.append("Consider budget review - less than 10% remaining")
        elif analytics_context['remaining_budget'] > analytics_context['total_grant_amount'] * 0.8:
            suggestions.append("High budget utilization - good grant management")
        
        return ChatResponse(
            response=response_text,
            insights=insights if insights else None,
            suggestions=suggestions if suggestions else None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat request: {str(e)}")


@router.get("/insights")
def get_ai_insights(db: Session = Depends(get_db)):
    """Get AI-generated insights about current analytics"""
    try:
        analytics_context = get_analytics_context(db)
        
        if "error" in analytics_context:
            raise HTTPException(status_code=500, detail=analytics_context["error"])
        
        # Generate insights using Gemini
        insights_prompt = f"""Based on this grant management analytics data, provide 3-5 key insights and 2-3 actionable recommendations:

Data: {analytics_context}

Focus on:
1. Budget utilization patterns
2. Compliance trends
3. Activity levels
4. Potential improvements
5. Risk indicators

Provide insights in a clear, actionable format."""

        insights_response = gemini_service.generate_insights(
            user_message=insights_prompt,
            system_prompt="You are a financial analytics expert. Provide clear, actionable insights.",
            analytics_data=analytics_context
        )
        
        return {
            "insights": insights_response,
            "data_snapshot": analytics_context
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
