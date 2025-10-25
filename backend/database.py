from datetime import datetime

from sqlalchemy import (JSON, Column, DateTime, Float, ForeignKey, Integer,
                        String, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./astrafund.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)  # "Program Manager", "Finance Director"
    
    # Relationships
    expenses = relationship("Expense", back_populates="submitter")
    approvals = relationship("Approval", back_populates="approver")

class Grant(Base):
    __tablename__ = "grants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    total_amount = Column(Float)
    rules_text = Column(String)
    
    # Relationships
    expenses = relationship("Expense", back_populates="grant")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    grant_id = Column(Integer, ForeignKey("grants.id"))
    submitter_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # "pending", "approved", "rejected"
    ai_compliance_check = Column(JSON)
    
    # Relationships
    grant = relationship("Grant", back_populates="expenses")
    submitter = relationship("User", back_populates="expenses")
    approvals = relationship("Approval", back_populates="expense")

class Approval(Base):
    __tablename__ = "approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    approver_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    expense = relationship("Expense", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
