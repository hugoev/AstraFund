#!/usr/bin/env python3
"""
Seed the database with sample data for AstraFund demo (Docker version)
ONLY creates data for the 3 demo users shown on the login page
"""

import os
import random
import sys

sys.path.append('/app')

from datetime import datetime, timedelta

from app.core.database import SessionLocal
from sqlalchemy import (JSON, Column, DateTime, Float, ForeignKey, Integer,
                        String, Text, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./astrafund.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expenses = relationship("Expense", back_populates="submitter")
    approvals = relationship("Approval", back_populates="approver")

class Grant(Base):
    __tablename__ = "grants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    total_amount = Column(Float)
    rules_text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    expenses = relationship("Expense", back_populates="grant")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    grant_id = Column(Integer, ForeignKey("grants.id"))
    submitter_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    ai_compliance_check = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    grant = relationship("Grant", back_populates="expenses")
    submitter = relationship("User", back_populates="expenses")
    approvals = relationship("Approval", back_populates="expense")
    payments = relationship("Payment", back_populates="expense")

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    expense = relationship("Expense", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    amount = Column(Float)
    payment_method = Column(String)
    payment_reference = Column(String)
    status = Column(String, default="pending")
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    expense = relationship("Expense", back_populates="payments")

class GrantProposal(Base):
    __tablename__ = "grant_proposals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    requested_amount = Column(Float)
    organization_name = Column(String)
    contact_email = Column(String)
    proposal_type = Column(String)
    status = Column(String, default="pending")
    ai_compliance_score = Column(Float, default=0.0)
    ai_compliance_notes = Column(Text)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


def seed_database():
    # Create tables first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seed for 3 demo users...")
        
        # Create ONLY the 3 demo users from the login page
        users = [
            User(username="john_manager", role="Program Manager"),
            User(username="sarah_finance", role="Finance Director"),
            User(username="admin", role="Administrator"),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"✅ Created {len(users)} demo users")
        
        # Get created users
        john = db.query(User).filter(User.username == "john_manager").first()
        sarah = db.query(User).filter(User.username == "sarah_finance").first()
        admin = db.query(User).filter(User.username == "admin").first()
        
        # Create diverse grants
        grants = [
            Grant(name="STEM Education Grant", total_amount=75000, 
                  rules_text="Funds for STEM education programs, equipment, and teacher training"),
            Grant(name="Arts & Culture Program", total_amount=50000, 
                  rules_text="Support for arts education, cultural events, and creative workshops"),
            Grant(name="Youth Development Fund", total_amount=60000, 
                  rules_text="Programs focused on youth leadership, mentorship, and skill development"),
            Grant(name="Community Health Initiative", total_amount=80000, 
                  rules_text="Healthcare access, wellness programs, and health education"),
            Grant(name="Environmental Sustainability", total_amount=55000, 
                  rules_text="Green initiatives, conservation projects, and environmental education"),
            Grant(name="Digital Literacy Program", total_amount=45000, 
                  rules_text="Technology training, digital skills, and computer access"),
        ]
        
        for grant in grants:
            db.add(grant)
        
        db.commit()
        print(f"✅ Created {len(grants)} grants")
        
        # Get all grants for expense creation
        all_grants = db.query(Grant).all()
        
        # Create expenses spread over 60 days with historical data
        expenses = []
        now = datetime.utcnow()
        
        # Expense templates with realistic descriptions
        expense_templates = [
            # STEM related
            {"desc": "Raspberry Pi computers for coding workshop", "amount_range": (800, 1500), "grant_match": "STEM"},
            {"desc": "Science lab equipment and supplies", "amount_range": (1200, 2500), "grant_match": "STEM"},
            {"desc": "Math teaching materials and manipulatives", "amount_range": (300, 800), "grant_match": "STEM"},
            {"desc": "Robotics kit for student projects", "amount_range": (600, 1200), "grant_match": "STEM"},
            
            # Arts related
            {"desc": "Art supplies for community workshop", "amount_range": (400, 900), "grant_match": "Arts"},
            {"desc": "Musical instruments for youth program", "amount_range": (1500, 3000), "grant_match": "Arts"},
            {"desc": "Theater production costumes and props", "amount_range": (500, 1200), "grant_match": "Arts"},
            
            # Youth Development
            {"desc": "Leadership training materials", "amount_range": (300, 700), "grant_match": "Youth"},
            {"desc": "Mentorship program coordination", "amount_range": (800, 1500), "grant_match": "Youth"},
            {"desc": "Sports equipment for after-school program", "amount_range": (600, 1200), "grant_match": "Youth"},
            
            # Health
            {"desc": "Health screening equipment", "amount_range": (1000, 2000), "grant_match": "Health"},
            {"desc": "Wellness workshop supplies", "amount_range": (300, 800), "grant_match": "Health"},
            {"desc": "First aid and safety training", "amount_range": (400, 900), "grant_match": "Health"},
            
            # Environmental
            {"desc": "Community garden supplies and tools", "amount_range": (500, 1000), "grant_match": "Environmental"},
            {"desc": "Recycling program equipment", "amount_range": (800, 1500), "grant_match": "Environmental"},
            {"desc": "Environmental education materials", "amount_range": (300, 700), "grant_match": "Environmental"},
            
            # Digital
            {"desc": "Laptops for digital literacy classes", "amount_range": (2000, 4000), "grant_match": "Digital"},
            {"desc": "Software licenses for training program", "amount_range": (500, 1200), "grant_match": "Digital"},
            {"desc": "Internet access for community center", "amount_range": (200, 500), "grant_match": "Digital"},
        ]
        
        # Create 90 expenses spread over 60 days
        for i in range(90):
            # Pick random template and grant
            template = random.choice(expense_templates)
            
            # Try to match template to appropriate grant
            matching_grants = [g for g in all_grants if template["grant_match"] in g.name]
            grant = random.choice(matching_grants if matching_grants else all_grants)
            
            # Rotate submitters (john submits most, sarah some, admin occasionally)
            if i % 10 < 7:
                submitter = john
            elif i % 10 < 9:
                submitter = sarah
            else:
                submitter = admin
            
            # Random amount within template range
            amount = round(random.uniform(*template["amount_range"]), 2)
            
            # Historical timestamp (spread over 60 days)
            days_ago = random.randint(0, 60)
            created_at = now - timedelta(days=days_ago)
            
            # Status distribution: 45% paid, 30% approved, 20% pending, 5% rejected
            status_roll = random.random()
            if status_roll < 0.45:
                status = "paid"
            elif status_roll < 0.75:
                status = "approved"
            elif status_roll < 0.95:
                status = "pending"
            else:
                status = "rejected"
            
            expense = Expense(
                description=template["desc"],
                amount=amount,
                grant_id=grant.id,
                submitter_id=submitter.id,
                status=status,
                ai_compliance_check={
                    "is_compliant": True if status != "rejected" else False,
                    "justification": f"Expense aligns with {grant.name} objectives"
                },
                created_at=created_at
            )
            expenses.append(expense)
            db.add(expense)
        
        db.commit()
        print(f"✅ Created {len(expenses)} expenses with historical timestamps")
        
        # Get all expenses for approval creation
        all_expenses = db.query(Expense).all()
        
        # Create approvals for approved/paid expenses
        approvals = []
        for expense in all_expenses:
            if expense.status in ["approved", "paid"]:
                # Sarah approves john's expenses, admin approves sarah's, john approves admin's
                if expense.submitter_id == john.id:
                    approver = sarah
                elif expense.submitter_id == sarah.id:
                    approver = admin
                else:
                    approver = john
                
                # Approval timestamp shortly after expense creation
                approval_timestamp = expense.created_at + timedelta(hours=random.randint(2, 48))
                
                approval = Approval(
                    expense_id=expense.id,
                    approver_id=approver.id,
                    timestamp=approval_timestamp
                )
                approvals.append(approval)
                db.add(approval)
        
        db.commit()
        print(f"✅ Created {len(approvals)} approvals")
        
        # Create payments for paid expenses
        payments = []
        payment_methods = ["bank_transfer", "credit_card", "check", "PayPal", "wire_transfer"]
        
        for expense in all_expenses:
            if expense.status == "paid":
                # Payment created shortly after approval
                payment_timestamp = expense.created_at + timedelta(hours=random.randint(48, 120))
                
                # Most payments completed, some pending
                payment_status = "completed" if random.random() < 0.85 else "pending"
                
                payment = Payment(
                    expense_id=expense.id,
                    amount=expense.amount,
                    payment_method=random.choice(payment_methods),
                    payment_reference=f"PAY-{random.randint(10000, 99999)}",
                    status=payment_status,
                    processed_at=payment_timestamp if payment_status == "completed" else None,
                    created_at=payment_timestamp - timedelta(hours=random.randint(1, 12))
                )
                payments.append(payment)
                db.add(payment)
        
        db.commit()
        print(f"✅ Created {len(payments)} payments")
        
        # Create grant proposals
        proposals = [
            GrantProposal(
                title="Youth Coding Bootcamp Initiative",
                description="A comprehensive 12-week coding bootcamp for underprivileged youth aged 15-18. Program includes Python, web development, and career mentorship.",
                requested_amount=45000,
                organization_name="TechFuture Foundation",
                contact_email="director@techfuture.org",
                proposal_type="education",
                status="pending",
                ai_compliance_score=0.92,
                ai_compliance_notes="Strong alignment with STEM education goals. Clear outcomes and budget breakdown.",
                created_at=now - timedelta(days=10)
            ),
            GrantProposal(
                title="Community Art Gallery and Workshop Space",
                description="Establish a community art gallery with weekly workshops for local artists. Includes equipment for ceramics, painting, and digital art.",
                requested_amount=38000,
                organization_name="Arts for All Collective",
                contact_email="info@artsforall.org",
                proposal_type="arts",
                status="under_review",
                ai_compliance_score=0.88,
                ai_compliance_notes="Good fit for Arts & Culture grant. Budget needs minor clarification.",
                reviewer_id=sarah.id,
                created_at=now - timedelta(days=15)
            ),
            GrantProposal(
                title="Mobile Health Screening Program",
                description="Deploy mobile health screening units to underserved communities. Focus on diabetes, blood pressure, and preventive care education.",
                requested_amount=62000,
                organization_name="HealthReach Community Services",
                contact_email="grants@healthreach.org",
                proposal_type="healthcare",
                status="approved",
                ai_compliance_score=0.95,
                ai_compliance_notes="Excellent proposal with measurable health outcomes. Strong community partnerships demonstrated.",
                reviewer_id=admin.id,
                reviewed_at=now - timedelta(days=3),
                created_at=now - timedelta(days=25)
            ),
            GrantProposal(
                title="Urban Garden Education Network",
                description="Create five community gardens with educational programs on sustainable agriculture, composting, and nutrition.",
                requested_amount=35000,
                organization_name="Green Neighborhoods Alliance",
                contact_email="grants@greenneighborhoods.org",
                proposal_type="environment",
                status="pending",
                ai_compliance_score=0.85,
                ai_compliance_notes="Aligns with environmental goals. Requesting more detail on long-term sustainability plan.",
                created_at=now - timedelta(days=5)
            ),
            GrantProposal(
                title="Senior Technology Literacy Program",
                description="Provide tablets and technology training for seniors (65+). Weekly classes on internet safety, video calling, and health apps.",
                requested_amount=28000,
                organization_name="Silver Surfers Initiative",
                contact_email="director@silversurfers.org",
                proposal_type="education",
                status="pending",
                ai_compliance_score=0.79,
                ai_compliance_notes="Good concept but budget breakdown needs more detail. Request revised proposal.",
                created_at=now - timedelta(days=7)
            ),
            GrantProposal(
                title="Youth Sports Leadership Academy",
                description="After-school sports program combined with leadership training, conflict resolution, and college prep for at-risk youth.",
                requested_amount=52000,
                organization_name="Champions Rising Foundation",
                contact_email="admin@championsrising.org",
                proposal_type="youth",
                status="rejected",
                ai_compliance_score=0.42,
                ai_compliance_notes="Proposal lacks clear metrics and outcome measurement. Budget heavily weighted toward equipment without program development.",
                reviewer_id=sarah.id,
                reviewed_at=now - timedelta(days=2),
                created_at=now - timedelta(days=20)
            ),
        ]
        
        for proposal in proposals:
            db.add(proposal)
        
        db.commit()
        print(f"✅ Created {len(proposals)} grant proposals")
        
        # Print summary
        print(f"\n📊 Summary:")
        print(f"   • {len(users)} demo users (john_manager, sarah_finance, admin)")
        print(f"   • {len(grants)} grants")
        print(f"   • {len(expenses)} expenses (spread over 60 days)")
        print(f"   • {len(approvals)} approvals")
        print(f"   • {len(payments)} payments")
        print(f"   • {len(proposals)} grant proposals")
        print(f"\n🎉 Database seeded successfully for demo!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

