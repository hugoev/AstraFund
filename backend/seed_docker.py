#!/usr/bin/env python3
"""
Seed the database with sample data for AstraFund demo (Docker version)
"""

import os
import sys

sys.path.append('/app')

from datetime import datetime

from app.core.database import SessionLocal
from sqlalchemy import (JSON, Column, DateTime, Float, ForeignKey, Integer,
                        String, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Database setup (same as in main.py)
SQLALCHEMY_DATABASE_URL = "sqlite:///./astrafund.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy models (same as in main.py)
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


def seed_database():
    # Create tables first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create sample users
        users = [
            User(username="john_manager", role="Program Manager"),
            User(username="sarah_finance", role="Finance Director"),
            User(username="mike_coordinator", role="Program Manager"),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        
        # Get the created users
        created_users = db.query(User).all()
        program_manager = created_users[0]
        finance_director = created_users[1]
        
        # Create sample grants
        grants = [
            Grant(
                name="STEM Education Initiative",
                total_amount=50000.00,
                rules_text="""This grant supports STEM education programs for underserved communities. 
                
Eligible expenses include:
- Educational technology and equipment (computers, tablets, robotics kits, etc.)
- Science laboratory supplies and materials
- Educational software and licenses
- Professional development for STEM educators
- Student competition fees and materials
- Transportation for field trips to science museums or tech companies

Expenses must directly support STEM learning objectives and benefit students in grades K-12. 
All technology purchases must be for educational use only. 
Professional development expenses require prior approval for amounts over $500."""
            ),
            Grant(
                name="Community Arts Program",
                total_amount=25000.00,
                rules_text="""This grant supports community arts and cultural programs.

Eligible expenses include:
- Art supplies and materials (paints, brushes, canvas, clay, etc.)
- Musical instruments and equipment
- Performance venue rental
- Artist fees and instructor costs
- Exhibition materials and display equipment
- Community event supplies

All expenses must support community arts programming and be open to the public. 
Artist fees must be documented with contracts. 
Equipment purchases over $200 require three quotes."""
            ),
            Grant(
                name="Environmental Conservation Project",
                total_amount=75000.00,
                rules_text="""This grant supports environmental conservation and sustainability initiatives.

Eligible expenses include:
- Native plant materials and seeds
- Conservation equipment and tools
- Educational materials about environmental topics
- Water conservation systems and equipment
- Renewable energy demonstration projects
- Environmental monitoring equipment
- Community education and outreach materials

All expenses must directly support environmental conservation goals. 
Equipment purchases must be for conservation purposes only. 
Educational materials must be scientifically accurate and age-appropriate."""
            )
        ]
        
        for grant in grants:
            db.add(grant)
        
        db.commit()
        
        # Get the created grants
        created_grants = db.query(Grant).all()
        stem_grant = created_grants[0]
        arts_grant = created_grants[1]
        env_grant = created_grants[2]
        
        # Create sample expenses
        expenses = [
            # STEM Education Initiative expenses
            Expense(
                description="10 Raspberry Pi computers for coding workshop",
                amount=400.00,
                grant_id=stem_grant.id,
                submitter_id=program_manager.id,
                status="approved",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Raspberry Pi computers are educational technology that directly supports STEM learning objectives for students."
                }
            ),
            Expense(
                description="Science lab equipment and supplies",
                amount=850.00,
                grant_id=stem_grant.id,
                submitter_id=program_manager.id,
                status="approved",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Science lab equipment directly supports STEM education and hands-on learning experiences for students."
                }
            ),
            Expense(
                description="Robotics kits for student competitions",
                amount=650.00,
                grant_id=stem_grant.id,
                submitter_id=program_manager.id,
                status="pending",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Robotics kits are educational technology that supports STEM learning and student competition participation."
                }
            ),
            Expense(
                description="Office furniture for administrative use",
                amount=1200.00,
                grant_id=stem_grant.id,
                submitter_id=program_manager.id,
                status="rejected",
                ai_compliance_check={
                    "is_compliant": False,
                    "justification": "Office furniture is not directly related to STEM education programming and does not support student learning objectives."
                }
            ),
            # Community Arts Program expenses
            Expense(
                description="Art supplies for community painting class",
                amount=150.00,
                grant_id=arts_grant.id,
                submitter_id=program_manager.id,
                status="pending",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Art supplies are eligible expenses for community arts programming and support public arts education."
                }
            ),
            Expense(
                description="Musical instruments for community orchestra",
                amount=1200.00,
                grant_id=arts_grant.id,
                submitter_id=program_manager.id,
                status="approved",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Musical instruments support community arts programming and public cultural activities."
                }
            ),
            Expense(
                description="Performance venue rental for spring concert",
                amount=800.00,
                grant_id=arts_grant.id,
                submitter_id=program_manager.id,
                status="pending",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Venue rental supports community arts programming and public cultural events."
                }
            ),
            # Environmental Conservation Project expenses
            Expense(
                description="Native plant seeds for restoration project",
                amount=300.00,
                grant_id=env_grant.id,
                submitter_id=program_manager.id,
                status="approved",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Native plant seeds directly support environmental conservation and habitat restoration goals."
                }
            ),
            Expense(
                description="Water monitoring equipment for stream analysis",
                amount=1500.00,
                grant_id=env_grant.id,
                submitter_id=program_manager.id,
                status="pending",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Water monitoring equipment supports environmental conservation and scientific research objectives."
                }
            ),
            Expense(
                description="Solar panel installation for community center",
                amount=5000.00,
                grant_id=env_grant.id,
                submitter_id=program_manager.id,
                status="approved",
                ai_compliance_check={
                    "is_compliant": True,
                    "justification": "Solar panels support renewable energy demonstration and environmental sustainability goals."
                }
            )
        ]
        
        for expense in expenses:
            db.add(expense)
        
        db.commit()
        
        # Get created expenses
        created_expenses = db.query(Expense).all()
        
        # Create sample approvals
        approvals = [
            Approval(expense_id=created_expenses[0].id, approver_id=finance_director.id),  # Raspberry Pi
            Approval(expense_id=created_expenses[1].id, approver_id=finance_director.id),  # Science lab equipment
            Approval(expense_id=created_expenses[5].id, approver_id=finance_director.id),  # Musical instruments
            Approval(expense_id=created_expenses[7].id, approver_id=finance_director.id),  # Native plant seeds
            Approval(expense_id=created_expenses[9].id, approver_id=finance_director.id),  # Solar panels
        ]
        
        for approval in approvals:
            db.add(approval)
        
        db.commit()
        
        # Create sample payments
        payments = [
            # Completed payments
            Payment(
                expense_id=created_expenses[0].id,  # Raspberry Pi
                amount=created_expenses[0].amount,
                payment_method="bank_transfer",
                payment_reference="PAY-STEM001",
                status="completed"
            ),
            Payment(
                expense_id=created_expenses[1].id,  # Science lab equipment
                amount=created_expenses[1].amount,
                payment_method="credit_card",
                payment_reference="PAY-STEM002",
                status="completed"
            ),
            Payment(
                expense_id=created_expenses[5].id,  # Musical instruments
                amount=created_expenses[5].amount,
                payment_method="bank_transfer",
                payment_reference="PAY-ARTS001",
                status="completed"
            ),
            Payment(
                expense_id=created_expenses[7].id,  # Native plant seeds
                amount=created_expenses[7].amount,
                payment_method="check",
                payment_reference="PAY-ENV001",
                status="completed"
            ),
            Payment(
                expense_id=created_expenses[9].id,  # Solar panels
                amount=created_expenses[9].amount,
                payment_method="bank_transfer",
                payment_reference="PAY-ENV002",
                status="completed"
            ),
            # Pending payments
            Payment(
                expense_id=created_expenses[2].id,  # Robotics kits
                amount=created_expenses[2].amount,
                payment_method="credit_card",
                payment_reference="PAY-STEM003",
                status="pending"
            ),
            Payment(
                expense_id=created_expenses[4].id,  # Art supplies
                amount=created_expenses[4].amount,
                payment_method="credit_card",
                payment_reference="PAY-ARTS002",
                status="pending"
            ),
            Payment(
                expense_id=created_expenses[6].id,  # Performance venue
                amount=created_expenses[6].amount,
                payment_method="bank_transfer",
                payment_reference="PAY-ARTS003",
                status="pending"
            ),
            Payment(
                expense_id=created_expenses[8].id,  # Water monitoring
                amount=created_expenses[8].amount,
                payment_method="credit_card",
                payment_reference="PAY-ENV003",
                status="pending"
            )
        ]
        
        for payment in payments:
            db.add(payment)
        
        db.commit()
        
        # Update expense statuses for paid expenses
        paid_expenses = [0, 1, 5, 7, 9]  # Indices of paid expenses
        for idx in paid_expenses:
            created_expenses[idx].status = "paid"
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"Created {len(created_users)} users")
        print(f"Created {len(created_grants)} grants")
        print(f"Created {len(expenses)} expenses")
        print(f"Created {len(approvals)} approvals")
        print(f"Created {len(payments)} payments")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
