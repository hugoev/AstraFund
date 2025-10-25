#!/usr/bin/env python3
"""
Seed the database with sample data for AstraFund demo
"""

from datetime import datetime

from database import Expense, Grant, SessionLocal, User


def seed_database():
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
                description="Office furniture for administrative use",
                amount=1200.00,
                grant_id=stem_grant.id,
                submitter_id=program_manager.id,
                status="rejected",
                ai_compliance_check={
                    "is_compliant": False,
                    "justification": "Office furniture is not directly related to STEM education programming and does not support student learning objectives."
                }
            )
        ]
        
        for expense in expenses:
            db.add(expense)
        
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"Created {len(created_users)} users")
        print(f"Created {len(created_grants)} grants")
        print(f"Created {len(expenses)} expenses")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
