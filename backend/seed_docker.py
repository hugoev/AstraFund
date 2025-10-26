#!/usr/bin/env python3
"""
Seed the database with sample data for AstraFund demo (Docker version)
"""

import os
import sys
import random

sys.path.append('/app')

from datetime import datetime, timedelta

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
        print("🌱 Starting database seed...")
        
        # Create comprehensive sample users for demo
        users = [
            # Program Managers (3 main demo users)
            User(username="john_manager", role="Program Manager"),
            User(username="mike_coordinator", role="Program Manager"),
            User(username="lisa_education", role="Program Manager"),
            User(username="david_arts", role="Program Manager"),
            User(username="maria_environment", role="Program Manager"),
            
            # Finance Team
            User(username="sarah_finance", role="Finance Director"),
            User(username="robert_accountant", role="Finance Director"),
            User(username="jennifer_controller", role="Finance Director"),
            
            # Executive Team
            User(username="alex_ceo", role="Executive Director"),
            User(username="patricia_admin", role="Administrator"),
            User(username="thomas_admin", role="Administrator"),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Get created users
        created_users = db.query(User).all()
        program_managers = [u for u in created_users if u.role == "Program Manager"]
        finance_directors = [u for u in created_users if u.role == "Finance Director"]
        executive_directors = [u for u in created_users if u.role == "Executive Director"]
        administrators = [u for u in created_users if u.role == "Administrator"]
        
        # Assign specific users for easier reference
        john_manager = program_managers[0]
        mike_coordinator = program_managers[1]
        lisa_education = program_managers[2]
        david_arts = program_managers[3]
        maria_environment = program_managers[4]
        
        sarah_finance = finance_directors[0]
        robert_accountant = finance_directors[1]
        jennifer_controller = finance_directors[2]
        
        alex_ceo = executive_directors[0]
        patricia_admin = administrators[0]
        thomas_admin = administrators[1]
        
        # Create comprehensive sample grants for demo
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
            ),
            Grant(
                name="Youth Development Fund",
                total_amount=30000.00,
                rules_text="""This grant supports youth development and mentorship programs.

Eligible expenses include:
- Educational materials and supplies
- Mentorship program coordination
- Youth leadership training materials
- Community service project supplies
- Transportation for youth activities
- Program coordinator stipends

All expenses must directly benefit youth ages 12-18. 
Programs must include mentorship or leadership development components."""
            ),
            Grant(
                name="Healthcare Access Initiative",
                total_amount=100000.00,
                rules_text="""This grant improves healthcare access for underserved communities.

Eligible expenses include:
- Medical equipment and supplies
- Health screening materials
- Transportation for medical appointments
- Health education materials
- Community health worker training
- Telemedicine equipment

All expenses must improve healthcare access for underserved populations. 
Medical equipment must be properly certified and maintained."""
            ),
            Grant(
                name="Digital Literacy Program",
                total_amount=40000.00,
                rules_text="""This grant provides digital literacy training and technology access.

Eligible expenses include:
- Computers and tablets for training
- Internet connectivity equipment
- Digital literacy curriculum materials
- Instructor training and certification
- Software licenses for educational use
- Technical support and maintenance

All technology must be used for educational purposes. 
Programs must serve adults and seniors in digital literacy."""
            ),
            Grant(
                name="Food Security Initiative",
                total_amount=60000.00,
                rules_text="""This grant addresses food insecurity in local communities.

Eligible expenses include:
- Food pantry supplies and equipment
- Community garden materials and tools
- Nutrition education materials
- Transportation for food distribution
- Refrigeration and storage equipment
- Volunteer coordination and training

All expenses must directly support food security initiatives. 
Programs must serve food-insecure populations."""
            ),
            Grant(
                name="Mental Health Support",
                total_amount=35000.00,
                rules_text="""This grant provides mental health resources and support services.

Eligible expenses include:
- Counseling and therapy services
- Mental health education materials
- Support group coordination
- Crisis intervention training
- Wellness program supplies
- Professional development for mental health workers

All services must be provided by licensed professionals. 
Programs must serve vulnerable populations."""
            )
        ]
        
        for grant in grants:
            db.add(grant)
        
        db.commit()
        print(f"✅ Created {len(grants)} grants")
        
        # Get created grants
        created_grants = db.query(Grant).all()
        stem_grant = created_grants[0]
        arts_grant = created_grants[1]
        env_grant = created_grants[2]
        youth_grant = created_grants[3]
        health_grant = created_grants[4]
        digital_grant = created_grants[5]
        food_grant = created_grants[6]
        mental_grant = created_grants[7]
        
        # Create comprehensive expenses with historical timestamps
        # Spread across last 60 days for trend visualization
        current_time = datetime.utcnow()
        
        expense_data = [
            # STEM Education Initiative expenses (20 expenses over 60 days)
            {"desc": "10 Raspberry Pi computers for coding workshop", "amt": 400.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 58, "compliant": True, "justification": "Raspberry Pi computers are educational technology that directly supports STEM learning objectives for students."},
            {"desc": "Science lab equipment and supplies", "amt": 850.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 55, "compliant": True, "justification": "Science lab equipment directly supports STEM education and hands-on learning experiences for students."},
            {"desc": "Robotics kits for student competitions", "amt": 650.00, "grant": stem_grant, "user": john_manager, "status": "approved", "days_ago": 52, "compliant": True, "justification": "Robotics kits are educational technology that supports STEM learning and student competition participation."},
            {"desc": "Laptop computers for programming class", "amt": 2400.00, "grant": stem_grant, "user": lisa_education, "status": "paid", "days_ago": 50, "compliant": True, "justification": "Laptop computers are essential educational technology for programming and STEM education."},
            {"desc": "3D printer for engineering projects", "amt": 1200.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 48, "compliant": True, "justification": "3D printers support hands-on engineering education and STEM learning objectives."},
            {"desc": "Microscopes for biology lab", "amt": 1800.00, "grant": stem_grant, "user": lisa_education, "status": "paid", "days_ago": 45, "compliant": True, "justification": "Microscopes are essential equipment for biology education and scientific observation."},
            {"desc": "Chemistry lab safety equipment", "amt": 450.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 42, "compliant": True, "justification": "Safety equipment is required for chemistry education and student protection."},
            {"desc": "Math software licenses for 50 students", "amt": 300.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 40, "compliant": True, "justification": "Educational software supports STEM learning and mathematical skill development."},
            {"desc": "Field trip to science museum", "amt": 200.00, "grant": stem_grant, "user": john_manager, "status": "approved", "days_ago": 38, "compliant": True, "justification": "Field trips to science museums support STEM education and hands-on learning experiences."},
            {"desc": "Professional development for STEM teachers", "amt": 750.00, "grant": stem_grant, "user": lisa_education, "status": "paid", "days_ago": 35, "compliant": True, "justification": "Teacher professional development directly improves STEM education quality and student outcomes."},
            {"desc": "Office furniture for administrative use", "amt": 1200.00, "grant": stem_grant, "user": john_manager, "status": "rejected", "days_ago": 33, "compliant": False, "justification": "Office furniture is not directly related to STEM education programming and does not support student learning objectives."},
            {"desc": "Student competition registration fees", "amt": 150.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 30, "compliant": True, "justification": "Competition fees support student participation in STEM competitions and skill development."},
            {"desc": "Arduino kits for electronics class", "amt": 500.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 28, "compliant": True, "justification": "Arduino kits support electronics education and hands-on STEM learning."},
            {"desc": "Science textbooks for library", "amt": 800.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 25, "compliant": True, "justification": "Science textbooks support STEM education and provide reference materials for students."},
            {"desc": "Lab coats and safety goggles", "amt": 200.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 22, "compliant": True, "justification": "Safety equipment is essential for laboratory work and student protection in STEM education."},
            {"desc": "Engineering design software licenses", "amt": 1100.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 20, "compliant": True, "justification": "Engineering software supports technical education and career preparation."},
            {"desc": "Scientific calculators for math class", "amt": 350.00, "grant": stem_grant, "user": john_manager, "status": "paid", "days_ago": 18, "compliant": True, "justification": "Calculators are essential tools for STEM education and mathematical learning."},
            {"desc": "Coding bootcamp instructor fees", "amt": 900.00, "grant": stem_grant, "user": lisa_education, "status": "approved", "days_ago": 15, "compliant": True, "justification": "Instructor fees support professional coding education delivery."},
            {"desc": "STEM competition travel expenses", "amt": 550.00, "grant": stem_grant, "user": john_manager, "status": "pending", "days_ago": 12, "compliant": True, "justification": "Competition travel supports student participation in STEM challenges."},
            {"desc": "Virtual reality headsets for science visualization", "amt": 1600.00, "grant": stem_grant, "user": lisa_education, "status": "pending", "days_ago": 8, "compliant": True, "justification": "VR equipment supports immersive STEM learning experiences."},
            
            # Community Arts Program expenses (15 expenses over 60 days)
            {"desc": "Art supplies for community painting class", "amt": 150.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 57, "compliant": True, "justification": "Art supplies are eligible expenses for community arts programming and support public arts education."},
            {"desc": "Musical instruments for community orchestra", "amt": 1200.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 54, "compliant": True, "justification": "Musical instruments support community arts programming and public cultural activities."},
            {"desc": "Performance venue rental for spring concert", "amt": 800.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 51, "compliant": True, "justification": "Venue rental supports community arts programming and public cultural events."},
            {"desc": "Canvas and paint supplies for art workshop", "amt": 300.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 48, "compliant": True, "justification": "Art supplies support community arts programming and public arts education."},
            {"desc": "Pottery wheel and clay for ceramics class", "amt": 600.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 45, "compliant": True, "justification": "Pottery equipment supports community arts programming and hands-on artistic education."},
            {"desc": "Artist instructor fees for workshop", "amt": 400.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 42, "compliant": True, "justification": "Artist fees support community arts programming and professional instruction."},
            {"desc": "Exhibition display materials", "amt": 250.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 39, "compliant": True, "justification": "Display materials support community arts programming and public exhibitions."},
            {"desc": "Sound system for outdoor concert", "amt": 900.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 36, "compliant": True, "justification": "Sound equipment supports community arts programming and public performances."},
            {"desc": "Dance studio rental for classes", "amt": 500.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 33, "compliant": True, "justification": "Studio rental supports community arts programming and dance education."},
            {"desc": "Photography equipment for workshop", "amt": 750.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 30, "compliant": True, "justification": "Photography equipment supports community arts programming and visual arts education."},
            {"desc": "Theater lighting equipment", "amt": 1200.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 27, "compliant": True, "justification": "Lighting equipment supports community arts programming and theatrical performances."},
            {"desc": "Community event decorations", "amt": 180.00, "grant": arts_grant, "user": david_arts, "status": "paid", "days_ago": 24, "compliant": True, "justification": "Event decorations support community arts programming and public cultural events."},
            {"desc": "Music sheet library for orchestra", "amt": 320.00, "grant": arts_grant, "user": david_arts, "status": "approved", "days_ago": 20, "compliant": True, "justification": "Music sheets support community orchestra programming."},
            {"desc": "Art gallery exhibition setup", "amt": 450.00, "grant": arts_grant, "user": david_arts, "status": "pending", "days_ago": 15, "compliant": True, "justification": "Gallery setup supports public arts exhibitions."},
            {"desc": "Cultural festival supplies", "amt": 550.00, "grant": arts_grant, "user": david_arts, "status": "pending", "days_ago": 10, "compliant": True, "justification": "Festival supplies support community cultural events."},
            
            # Environmental Conservation Project expenses (15 expenses over 60 days)
            {"desc": "Native plant seeds for restoration project", "amt": 300.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 59, "compliant": True, "justification": "Native plant seeds directly support environmental conservation and habitat restoration goals."},
            {"desc": "Water monitoring equipment for stream analysis", "amt": 1500.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 56, "compliant": True, "justification": "Water monitoring equipment supports environmental conservation and scientific research objectives."},
            {"desc": "Solar panel installation for community center", "amt": 5000.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 53, "compliant": True, "justification": "Solar panels support renewable energy demonstration and environmental sustainability goals."},
            {"desc": "Composting bins for community garden", "amt": 400.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 50, "compliant": True, "justification": "Composting equipment supports environmental conservation and waste reduction initiatives."},
            {"desc": "Rainwater collection system", "amt": 1200.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 47, "compliant": True, "justification": "Rainwater collection supports water conservation and environmental sustainability."},
            {"desc": "Environmental education materials", "amt": 350.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 44, "compliant": True, "justification": "Educational materials support environmental conservation education and community awareness."},
            {"desc": "Tree planting tools and supplies", "amt": 200.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 41, "compliant": True, "justification": "Tree planting supplies support environmental conservation and habitat restoration."},
            {"desc": "Air quality monitoring station", "amt": 2500.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 38, "compliant": True, "justification": "Air quality monitoring supports environmental conservation and scientific research."},
            {"desc": "Wildlife habitat restoration materials", "amt": 800.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 35, "compliant": True, "justification": "Habitat restoration materials support environmental conservation and wildlife protection."},
            {"desc": "Community garden irrigation system", "amt": 600.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 32, "compliant": True, "justification": "Irrigation systems support water conservation and sustainable gardening practices."},
            {"desc": "Electric vehicle charging station", "amt": 3500.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 29, "compliant": True, "justification": "EV charging supports renewable transportation and sustainability."},
            {"desc": "Recycling program supplies", "amt": 450.00, "grant": env_grant, "user": maria_environment, "status": "approved", "days_ago": 26, "compliant": True, "justification": "Recycling supplies support waste reduction initiatives."},
            {"desc": "Butterfly garden native plants", "amt": 280.00, "grant": env_grant, "user": maria_environment, "status": "paid", "days_ago": 23, "compliant": True, "justification": "Native plants support biodiversity and habitat creation."},
            {"desc": "Energy efficiency workshop materials", "amt": 220.00, "grant": env_grant, "user": maria_environment, "status": "pending", "days_ago": 18, "compliant": True, "justification": "Workshop materials support energy conservation education."},
            {"desc": "Wetland restoration equipment", "amt": 920.00, "grant": env_grant, "user": maria_environment, "status": "pending", "days_ago": 14, "compliant": True, "justification": "Equipment supports wetland ecosystem restoration."},
            
            # Youth Development Fund expenses (12 expenses over 60 days)
            {"desc": "Leadership training materials", "amt": 250.00, "grant": youth_grant, "user": mike_coordinator, "status": "paid", "days_ago": 58, "compliant": True, "justification": "Leadership materials support youth development and mentorship program objectives."},
            {"desc": "Mentorship program coordinator stipend", "amt": 1200.00, "grant": youth_grant, "user": mike_coordinator, "status": "approved", "days_ago": 54, "compliant": True, "justification": "Coordinator stipends support youth development program implementation and mentorship activities."},
            {"desc": "Community service project supplies", "amt": 400.00, "grant": youth_grant, "user": mike_coordinator, "status": "paid", "days_ago": 50, "compliant": True, "justification": "Project supplies support youth development through community service and civic engagement."},
            {"desc": "Youth transportation for activities", "amt": 300.00, "grant": youth_grant, "user": mike_coordinator, "status": "approved", "days_ago": 46, "compliant": True, "justification": "Transportation supports youth development program participation and accessibility."},
            {"desc": "Educational field trip expenses", "amt": 500.00, "grant": youth_grant, "user": mike_coordinator, "status": "paid", "days_ago": 42, "compliant": True, "justification": "Field trips support youth development through educational experiences and skill building."},
            {"desc": "Youth leadership conference registration", "amt": 800.00, "grant": youth_grant, "user": mike_coordinator, "status": "approved", "days_ago": 38, "compliant": True, "justification": "Conference registration supports youth development through leadership training and networking."},
            {"desc": "Mentorship program materials", "amt": 150.00, "grant": youth_grant, "user": mike_coordinator, "status": "paid", "days_ago": 34, "compliant": True, "justification": "Program materials support youth development and mentorship relationship building."},
            {"desc": "Youth activity equipment", "amt": 600.00, "grant": youth_grant, "user": mike_coordinator, "status": "approved", "days_ago": 30, "compliant": True, "justification": "Activity equipment supports youth development through recreational and educational programming."},
            {"desc": "Career workshop supplies", "amt": 320.00, "grant": youth_grant, "user": mike_coordinator, "status": "paid", "days_ago": 26, "compliant": True, "justification": "Career workshops support youth development and professional preparation."},
            {"desc": "Team building retreat expenses", "amt": 750.00, "grant": youth_grant, "user": mike_coordinator, "status": "approved", "days_ago": 22, "compliant": True, "justification": "Team building supports leadership development."},
            {"desc": "Volunteer training materials", "amt": 180.00, "grant": youth_grant, "user": mike_coordinator, "status": "pending", "days_ago": 16, "compliant": True, "justification": "Training materials support volunteer mentors."},
            {"desc": "Youth skills workshop equipment", "amt": 420.00, "grant": youth_grant, "user": mike_coordinator, "status": "pending", "days_ago": 11, "compliant": True, "justification": "Equipment supports skill development workshops."},
            
            # Healthcare Access Initiative expenses (12 expenses over 60 days)
            {"desc": "Medical screening equipment", "amt": 2000.00, "grant": health_grant, "user": alex_ceo, "status": "paid", "days_ago": 57, "compliant": True, "justification": "Medical equipment improves healthcare access for underserved populations and supports health screening services."},
            {"desc": "Health education materials", "amt": 400.00, "grant": health_grant, "user": alex_ceo, "status": "approved", "days_ago": 53, "compliant": True, "justification": "Education materials improve healthcare access through health literacy and community education."},
            {"desc": "Transportation for medical appointments", "amt": 600.00, "grant": health_grant, "user": alex_ceo, "status": "paid", "days_ago": 49, "compliant": True, "justification": "Transportation improves healthcare access for underserved populations with mobility barriers."},
            {"desc": "Telemedicine equipment setup", "amt": 1500.00, "grant": health_grant, "user": alex_ceo, "status": "approved", "days_ago": 45, "compliant": True, "justification": "Telemedicine equipment improves healthcare access through remote consultation services."},
            {"desc": "Community health worker training", "amt": 800.00, "grant": health_grant, "user": alex_ceo, "status": "paid", "days_ago": 41, "compliant": True, "justification": "Health worker training improves healthcare access through community-based health services."},
            {"desc": "Health screening event supplies", "amt": 300.00, "grant": health_grant, "user": alex_ceo, "status": "approved", "days_ago": 37, "compliant": True, "justification": "Screening supplies improve healthcare access through preventive health services for underserved communities."},
            {"desc": "Medical interpreter services", "amt": 500.00, "grant": health_grant, "user": alex_ceo, "status": "paid", "days_ago": 33, "compliant": True, "justification": "Interpreter services improve healthcare access for non-English speaking populations."},
            {"desc": "Community health outreach materials", "amt": 250.00, "grant": health_grant, "user": alex_ceo, "status": "approved", "days_ago": 29, "compliant": True, "justification": "Outreach materials improve healthcare access through community education and awareness."},
            {"desc": "Mobile clinic medical supplies", "amt": 1800.00, "grant": health_grant, "user": alex_ceo, "status": "paid", "days_ago": 25, "compliant": True, "justification": "Mobile clinic supplies support healthcare access in remote areas."},
            {"desc": "Patient navigation program", "amt": 900.00, "grant": health_grant, "user": alex_ceo, "status": "approved", "days_ago": 21, "compliant": True, "justification": "Navigation program improves healthcare access and coordination."},
            {"desc": "Health fair coordination expenses", "amt": 650.00, "grant": health_grant, "user": alex_ceo, "status": "pending", "days_ago": 17, "compliant": True, "justification": "Health fairs provide community healthcare access."},
            {"desc": "Chronic disease management supplies", "amt": 720.00, "grant": health_grant, "user": alex_ceo, "status": "pending", "days_ago": 13, "compliant": True, "justification": "Supplies support chronic disease education and management."},
            
            # Digital Literacy Program expenses (10 expenses over 60 days)
            {"desc": "Laptop computers for digital literacy training", "amt": 4000.00, "grant": digital_grant, "user": patricia_admin, "status": "paid", "days_ago": 56, "compliant": True, "justification": "Computers are essential for digital literacy training and technology education for adults and seniors."},
            {"desc": "Internet connectivity equipment", "amt": 800.00, "grant": digital_grant, "user": patricia_admin, "status": "approved", "days_ago": 52, "compliant": True, "justification": "Internet equipment supports digital literacy training and technology access for underserved populations."},
            {"desc": "Digital literacy curriculum materials", "amt": 300.00, "grant": digital_grant, "user": patricia_admin, "status": "paid", "days_ago": 48, "compliant": True, "justification": "Curriculum materials support digital literacy education and structured learning programs."},
            {"desc": "Instructor training and certification", "amt": 600.00, "grant": digital_grant, "user": patricia_admin, "status": "approved", "days_ago": 44, "compliant": True, "justification": "Instructor training improves digital literacy program quality and educational effectiveness."},
            {"desc": "Software licenses for educational use", "amt": 500.00, "grant": digital_grant, "user": patricia_admin, "status": "paid", "days_ago": 40, "compliant": True, "justification": "Software licenses support digital literacy training and educational technology access."},
            {"desc": "Tablet computers for mobile learning", "amt": 2000.00, "grant": digital_grant, "user": patricia_admin, "status": "approved", "days_ago": 36, "compliant": True, "justification": "Tablets support digital literacy training and provide accessible technology for seniors and adults."},
            {"desc": "Technical support and maintenance", "amt": 400.00, "grant": digital_grant, "user": patricia_admin, "status": "paid", "days_ago": 32, "compliant": True, "justification": "Technical support ensures digital literacy program sustainability and equipment functionality."},
            {"desc": "Digital safety and security training materials", "amt": 200.00, "grant": digital_grant, "user": patricia_admin, "status": "approved", "days_ago": 28, "compliant": True, "justification": "Safety training materials support digital literacy education and online security awareness."},
            {"desc": "Online learning platform subscription", "amt": 480.00, "grant": digital_grant, "user": patricia_admin, "status": "pending", "days_ago": 20, "compliant": True, "justification": "Platform subscription supports remote digital literacy training."},
            {"desc": "Computer lab furniture and setup", "amt": 1200.00, "grant": digital_grant, "user": patricia_admin, "status": "pending", "days_ago": 15, "compliant": True, "justification": "Lab setup supports effective digital literacy education environment."},
            
            # Food Security Initiative expenses (10 expenses over 60 days)
            {"desc": "Food pantry refrigeration equipment", "amt": 1500.00, "grant": food_grant, "user": thomas_admin, "status": "paid", "days_ago": 55, "compliant": True, "justification": "Refrigeration equipment supports food security initiatives and food storage for underserved populations."},
            {"desc": "Community garden tools and supplies", "amt": 400.00, "grant": food_grant, "user": thomas_admin, "status": "approved", "days_ago": 51, "compliant": True, "justification": "Garden supplies support food security through community food production and sustainable agriculture."},
            {"desc": "Nutrition education materials", "amt": 250.00, "grant": food_grant, "user": thomas_admin, "status": "paid", "days_ago": 47, "compliant": True, "justification": "Nutrition education supports food security through healthy eating education and food literacy."},
            {"desc": "Food distribution transportation", "amt": 600.00, "grant": food_grant, "user": thomas_admin, "status": "approved", "days_ago": 43, "compliant": True, "justification": "Transportation supports food security initiatives and food access for underserved populations."},
            {"desc": "Volunteer coordination and training", "amt": 300.00, "grant": food_grant, "user": thomas_admin, "status": "paid", "days_ago": 39, "compliant": True, "justification": "Volunteer training supports food security program implementation and community engagement."},
            {"desc": "Food storage and packaging supplies", "amt": 350.00, "grant": food_grant, "user": thomas_admin, "status": "approved", "days_ago": 35, "compliant": True, "justification": "Storage supplies support food security through proper food handling and preservation."},
            {"desc": "Community kitchen equipment", "amt": 800.00, "grant": food_grant, "user": thomas_admin, "status": "paid", "days_ago": 31, "compliant": True, "justification": "Kitchen equipment supports food security through community food preparation and cooking education."},
            {"desc": "Food rescue program coordination", "amt": 500.00, "grant": food_grant, "user": thomas_admin, "status": "approved", "days_ago": 27, "compliant": True, "justification": "Food rescue coordination supports food security through food waste reduction and redistribution."},
            {"desc": "Mobile food pantry van", "amt": 2500.00, "grant": food_grant, "user": thomas_admin, "status": "pending", "days_ago": 19, "compliant": True, "justification": "Mobile pantry increases food access in underserved areas."},
            {"desc": "Cooking class supplies", "amt": 380.00, "grant": food_grant, "user": thomas_admin, "status": "pending", "days_ago": 14, "compliant": True, "justification": "Cooking classes support nutrition education and food literacy."},
            
            # Mental Health Support expenses (8 expenses over 60 days)
            {"desc": "Licensed therapist counseling services", "amt": 3000.00, "grant": mental_grant, "user": alex_ceo, "status": "paid", "days_ago": 54, "compliant": True, "justification": "Licensed therapy services provide essential mental health support for vulnerable populations."},
            {"desc": "Mental health education materials", "amt": 400.00, "grant": mental_grant, "user": alex_ceo, "status": "approved", "days_ago": 49, "compliant": True, "justification": "Education materials support mental health awareness and community education for vulnerable populations."},
            {"desc": "Support group coordination", "amt": 600.00, "grant": mental_grant, "user": alex_ceo, "status": "paid", "days_ago": 44, "compliant": True, "justification": "Support group coordination provides peer support and mental health resources for vulnerable populations."},
            {"desc": "Crisis intervention training", "amt": 800.00, "grant": mental_grant, "user": alex_ceo, "status": "approved", "days_ago": 39, "compliant": True, "justification": "Crisis training improves mental health support capacity and emergency response for vulnerable populations."},
            {"desc": "Wellness program supplies", "amt": 300.00, "grant": mental_grant, "user": alex_ceo, "status": "paid", "days_ago": 34, "compliant": True, "justification": "Wellness supplies support mental health through stress reduction and self-care activities."},
            {"desc": "Professional development for mental health workers", "amt": 1000.00, "grant": mental_grant, "user": alex_ceo, "status": "approved", "days_ago": 29, "compliant": True, "justification": "Professional development improves mental health service quality and support for vulnerable populations."},
            {"desc": "Mental health hotline setup", "amt": 850.00, "grant": mental_grant, "user": alex_ceo, "status": "pending", "days_ago": 21, "compliant": True, "justification": "Hotline provides 24/7 mental health support access."},
            {"desc": "Peer support training program", "amt": 520.00, "grant": mental_grant, "user": alex_ceo, "status": "pending", "days_ago": 16, "compliant": True, "justification": "Peer training expands mental health support capacity."},
        ]
        
        expenses = []
        for data in expense_data:
            created_at = current_time - timedelta(days=data["days_ago"])
            expense = Expense(
                description=data["desc"],
                amount=data["amt"],
                grant_id=data["grant"].id,
                submitter_id=data["user"].id,
                status=data["status"],
                ai_compliance_check={
                    "is_compliant": data["compliant"],
                    "justification": data["justification"]
                },
                created_at=created_at
            )
            expenses.append(expense)
            db.add(expense)
        
        db.commit()
        print(f"✅ Created {len(expenses)} expenses with historical timestamps")
        
        # Get created expenses
        created_expenses = db.query(Expense).all()
        approved_and_paid_expenses = [exp for exp in created_expenses if exp.status in ["approved", "paid"]]
        
        # Create approvals for all approved and paid expenses
        approvals = []
        for expense in approved_and_paid_expenses:
            # Assign different approvers based on amount
            if expense.amount < 1000:
                approver = sarah_finance
            elif expense.amount < 3000:
                approver = robert_accountant
            else:
                approver = jennifer_controller
            
            approval_time = expense.created_at + timedelta(hours=random.randint(2, 48))
            approval = Approval(
                expense_id=expense.id,
                approver_id=approver.id,
                timestamp=approval_time
            )
            approvals.append(approval)
            db.add(approval)
        
        db.commit()
        print(f"✅ Created {len(approvals)} approvals")
        
        # Create payments for paid expenses
        payments = []
        payment_methods = ["bank_transfer", "credit_card", "check", "paypal", "wire_transfer"]
        payment_statuses = ["completed", "pending", "processing"]
        
        paid_expenses = [exp for exp in created_expenses if exp.status == "paid"]
        
        for i, expense in enumerate(paid_expenses):
            # Most payments are completed, some are processing
            if random.random() < 0.85:
                status = "completed"
            else:
                status = "processing"
            
            method = payment_methods[i % len(payment_methods)]
            
            # Generate payment reference
            grant_prefix = expense.grant.name.split()[0][:3].upper()
            payment_ref = f"PAY-{grant_prefix}{i+1:03d}"
            
            # Payment created 1-3 days after expense approval
            payment_time = expense.created_at + timedelta(days=random.randint(1, 3))
            
            payment = Payment(
                expense_id=expense.id,
                amount=expense.amount,
                payment_method=method,
                payment_reference=payment_ref,
                status=status,
                created_at=payment_time,
                processed_at=payment_time if status == "completed" else None
            )
            payments.append(payment)
            db.add(payment)
        
        # Create some pending payments for approved expenses
        approved_expenses = [exp for exp in created_expenses if exp.status == "approved"]
        for i, expense in enumerate(approved_expenses[:15]):  # Create pending payments for first 15 approved expenses
            method = payment_methods[i % len(payment_methods)]
            grant_prefix = expense.grant.name.split()[0][:3].upper()
            payment_ref = f"PAY-{grant_prefix}{len(paid_expenses)+i+1:03d}"
            
            payment_time = expense.created_at + timedelta(days=random.randint(0, 2))
            
            payment = Payment(
                expense_id=expense.id,
                amount=expense.amount,
                payment_method=method,
                payment_reference=payment_ref,
                status="pending",
                created_at=payment_time
            )
            payments.append(payment)
            db.add(payment)
        
        db.commit()
        print(f"✅ Created {len(payments)} payments")
        
        print(f"\n📊 Summary:")
        print(f"   • {len(created_users)} users")
        print(f"   • {len(created_grants)} grants")
        print(f"   • {len(expenses)} expenses (spread over 60 days)")
        print(f"   • {len(approvals)} approvals")
        print(f"   • {len(payments)} payments")
        print(f"\n🎉 Database seeded successfully for analytics demo!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
