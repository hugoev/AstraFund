"""
Database seeding script
"""
import sys
from datetime import datetime
from pathlib import Path

# Add app to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import Base, SessionLocal, engine
from app.core.logging import get_logger
from app.models.database import (Approval, Expense, Grant, GrantProposal,
                                 Payment, User)

logger = get_logger(__name__)


def seed_database():
    """Seed the database with sample data"""
    # Create tables
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
        
        # Get created users
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
        
        # Get created grants
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
        approved_expenses = [created_expenses[0], created_expenses[1], created_expenses[5], created_expenses[7], created_expenses[9]]  # Approved expenses
        
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
        
        # Create mock grant proposals
        proposals = [
            GrantProposal(
                title="STEM Education Initiative",
                description="A comprehensive program to introduce robotics and coding to underserved middle school students. The program will provide hands-on learning experiences with Arduino kits, 3D printing, and basic programming concepts.",
                requested_amount=25000.00,
                organization_name="TechEd Foundation",
                contact_email="contact@techedfoundation.org",
                proposal_type="education",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Community Health Outreach",
                description="Mobile health clinic services for rural communities including basic health screenings, vaccination programs, and health education workshops.",
                requested_amount=45000.00,
                organization_name="Rural Health Alliance",
                contact_email="info@ruralhealthalliance.org",
                proposal_type="healthcare",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Environmental Conservation Project",
                description="Wetland restoration and wildlife habitat preservation program including native plant restoration, water quality monitoring, and community education.",
                requested_amount=35000.00,
                organization_name="Green Earth Society",
                contact_email="projects@greenearthsociety.org",
                proposal_type="environment",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Youth Arts Program",
                description="Community arts education program providing free music, dance, and visual arts classes to at-risk youth with public performances and exhibitions.",
                requested_amount=18000.00,
                organization_name="Creative Youth Foundation",
                contact_email="programs@creativeyouth.org",
                proposal_type="arts",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Food Security Initiative",
                description="Urban farming and food distribution program to address food insecurity in low-income neighborhoods through community gardens and food banks.",
                requested_amount=30000.00,
                organization_name="Urban Harvest",
                contact_email="contact@urbanharvest.org",
                proposal_type="social_services",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Digital Literacy Training",
                description="Computer skills training program for seniors and adults including basic computer operation, internet safety, and job search assistance.",
                requested_amount=22000.00,
                organization_name="Digital Inclusion Network",
                contact_email="training@digitalinclusion.org",
                proposal_type="education",
                status="under_review",
                ai_compliance_score=0.85,
                ai_compliance_notes="Strong alignment with education goals, well-defined objectives, reasonable budget allocation."
            ),
            GrantProposal(
                title="Mental Health Support Services",
                description="Counseling and support services for individuals experiencing mental health challenges, including group therapy sessions and crisis intervention.",
                requested_amount=55000.00,
                organization_name="Wellness Center",
                contact_email="services@wellnesscenter.org",
                proposal_type="healthcare",
                status="approved",
                ai_compliance_score=0.92,
                ai_compliance_notes="Excellent proposal with clear impact metrics, experienced team, and strong community need.",
                reviewer_id=1,
                reviewed_at=datetime(2024, 1, 15, 10, 30, 0)
            ),
            GrantProposal(
                title="Renewable Energy Education",
                description="Solar panel installation training program for local residents and small business owners to promote renewable energy adoption.",
                requested_amount=40000.00,
                organization_name="Clean Energy Coalition",
                contact_email="education@cleanenergycoalition.org",
                proposal_type="environment",
                status="rejected",
                ai_compliance_score=0.45,
                ai_compliance_notes="Proposal lacks clear implementation timeline and budget justification for equipment costs.",
                reviewer_id=1,
                reviewed_at=datetime(2024, 1, 10, 14, 20, 0)
            )
        ]
        
        for proposal in proposals:
            db.add(proposal)
        
        db.commit()
        
        logger.info("✅ Database seeded successfully!")
        logger.info(f"Created {len(created_users)} users")
        logger.info(f"Created {len(created_grants)} grants")
        logger.info(f"Created {len(expenses)} expenses")
        logger.info(f"Created {len(approvals)} approvals")
        logger.info(f"Created {len(payments)} payments")
        logger.info(f"Created {len(proposals)} grant proposals")
        
    except Exception as e:
        logger.error(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
