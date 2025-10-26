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
        # Create comprehensive sample users for demo
        users = [
            # Program Managers
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
        
        # Create comprehensive sample expenses for demo
        expenses = [
            # STEM Education Initiative expenses (15 expenses)
            Expense(description="10 Raspberry Pi computers for coding workshop", amount=400.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Raspberry Pi computers are educational technology that directly supports STEM learning objectives for students."}),
            Expense(description="Science lab equipment and supplies", amount=850.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Science lab equipment directly supports STEM education and hands-on learning experiences for students."}),
            Expense(description="Robotics kits for student competitions", amount=650.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Robotics kits are educational technology that supports STEM learning and student competition participation."}),
            Expense(description="Laptop computers for programming class", amount=2400.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Laptop computers are essential educational technology for programming and STEM education."}),
            Expense(description="3D printer for engineering projects", amount=1200.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "3D printers support hands-on engineering education and STEM learning objectives."}),
            Expense(description="Microscopes for biology lab", amount=1800.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Microscopes are essential equipment for biology education and scientific observation."}),
            Expense(description="Chemistry lab safety equipment", amount=450.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Safety equipment is required for chemistry education and student protection."}),
            Expense(description="Math software licenses for 50 students", amount=300.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Educational software supports STEM learning and mathematical skill development."}),
            Expense(description="Field trip to science museum", amount=200.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Field trips to science museums support STEM education and hands-on learning experiences."}),
            Expense(description="Professional development for STEM teachers", amount=750.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Teacher professional development directly improves STEM education quality and student outcomes."}),
            Expense(description="Office furniture for administrative use", amount=1200.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="rejected", ai_compliance_check={"is_compliant": False, "justification": "Office furniture is not directly related to STEM education programming and does not support student learning objectives."}),
            Expense(description="Student competition registration fees", amount=150.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Competition fees support student participation in STEM competitions and skill development."}),
            Expense(description="Arduino kits for electronics class", amount=500.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Arduino kits support electronics education and hands-on STEM learning."}),
            Expense(description="Science textbooks for library", amount=800.00, grant_id=stem_grant.id, submitter_id=lisa_education.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Science textbooks support STEM education and provide reference materials for students."}),
            Expense(description="Lab coats and safety goggles", amount=200.00, grant_id=stem_grant.id, submitter_id=john_manager.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Safety equipment is essential for laboratory work and student protection in STEM education."}),
            
            # Community Arts Program expenses (12 expenses)
            Expense(description="Art supplies for community painting class", amount=150.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Art supplies are eligible expenses for community arts programming and support public arts education."}),
            Expense(description="Musical instruments for community orchestra", amount=1200.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Musical instruments support community arts programming and public cultural activities."}),
            Expense(description="Performance venue rental for spring concert", amount=800.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Venue rental supports community arts programming and public cultural events."}),
            Expense(description="Canvas and paint supplies for art workshop", amount=300.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Art supplies support community arts programming and public arts education."}),
            Expense(description="Pottery wheel and clay for ceramics class", amount=600.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Pottery equipment supports community arts programming and hands-on artistic education."}),
            Expense(description="Artist instructor fees for workshop", amount=400.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Artist fees support community arts programming and professional instruction."}),
            Expense(description="Exhibition display materials", amount=250.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Display materials support community arts programming and public exhibitions."}),
            Expense(description="Sound system for outdoor concert", amount=900.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Sound equipment supports community arts programming and public performances."}),
            Expense(description="Dance studio rental for classes", amount=500.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Studio rental supports community arts programming and dance education."}),
            Expense(description="Photography equipment for workshop", amount=750.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Photography equipment supports community arts programming and visual arts education."}),
            Expense(description="Theater lighting equipment", amount=1200.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Lighting equipment supports community arts programming and theatrical performances."}),
            Expense(description="Community event decorations", amount=180.00, grant_id=arts_grant.id, submitter_id=david_arts.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Event decorations support community arts programming and public cultural events."}),
            
            # Environmental Conservation Project expenses (10 expenses)
            Expense(description="Native plant seeds for restoration project", amount=300.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Native plant seeds directly support environmental conservation and habitat restoration goals."}),
            Expense(description="Water monitoring equipment for stream analysis", amount=1500.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Water monitoring equipment supports environmental conservation and scientific research objectives."}),
            Expense(description="Solar panel installation for community center", amount=5000.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Solar panels support renewable energy demonstration and environmental sustainability goals."}),
            Expense(description="Composting bins for community garden", amount=400.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Composting equipment supports environmental conservation and waste reduction initiatives."}),
            Expense(description="Rainwater collection system", amount=1200.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Rainwater collection supports water conservation and environmental sustainability."}),
            Expense(description="Environmental education materials", amount=350.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Educational materials support environmental conservation education and community awareness."}),
            Expense(description="Tree planting tools and supplies", amount=200.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Tree planting supplies support environmental conservation and habitat restoration."}),
            Expense(description="Air quality monitoring station", amount=2500.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Air quality monitoring supports environmental conservation and scientific research."}),
            Expense(description="Wildlife habitat restoration materials", amount=800.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Habitat restoration materials support environmental conservation and wildlife protection."}),
            Expense(description="Community garden irrigation system", amount=600.00, grant_id=env_grant.id, submitter_id=maria_environment.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Irrigation systems support water conservation and sustainable gardening practices."}),
            
            # Youth Development Fund expenses (8 expenses)
            Expense(description="Leadership training materials", amount=250.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Leadership materials support youth development and mentorship program objectives."}),
            Expense(description="Mentorship program coordinator stipend", amount=1200.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Coordinator stipends support youth development program implementation and mentorship activities."}),
            Expense(description="Community service project supplies", amount=400.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Project supplies support youth development through community service and civic engagement."}),
            Expense(description="Youth transportation for activities", amount=300.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Transportation supports youth development program participation and accessibility."}),
            Expense(description="Educational field trip expenses", amount=500.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Field trips support youth development through educational experiences and skill building."}),
            Expense(description="Youth leadership conference registration", amount=800.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Conference registration supports youth development through leadership training and networking."}),
            Expense(description="Mentorship program materials", amount=150.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Program materials support youth development and mentorship relationship building."}),
            Expense(description="Youth activity equipment", amount=600.00, grant_id=youth_grant.id, submitter_id=mike_coordinator.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Activity equipment supports youth development through recreational and educational programming."}),
            
            # Healthcare Access Initiative expenses (10 expenses)
            Expense(description="Medical screening equipment", amount=2000.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Medical equipment improves healthcare access for underserved populations and supports health screening services."}),
            Expense(description="Health education materials", amount=400.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Education materials improve healthcare access through health literacy and community education."}),
            Expense(description="Transportation for medical appointments", amount=600.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Transportation improves healthcare access for underserved populations with mobility barriers."}),
            Expense(description="Telemedicine equipment setup", amount=1500.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Telemedicine equipment improves healthcare access through remote consultation services."}),
            Expense(description="Community health worker training", amount=800.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Health worker training improves healthcare access through community-based health services."}),
            Expense(description="Prescription assistance program", amount=1000.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Prescription assistance improves healthcare access for underserved populations with medication needs."}),
            Expense(description="Mental health counseling services", amount=2000.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Counseling services improve healthcare access through mental health support for vulnerable populations."}),
            Expense(description="Health screening event supplies", amount=300.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Screening supplies improve healthcare access through preventive health services for underserved communities."}),
            Expense(description="Medical interpreter services", amount=500.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Interpreter services improve healthcare access for non-English speaking populations."}),
            Expense(description="Community health outreach materials", amount=250.00, grant_id=health_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Outreach materials improve healthcare access through community education and awareness."}),
            
            # Digital Literacy Program expenses (8 expenses)
            Expense(description="Laptop computers for digital literacy training", amount=4000.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Computers are essential for digital literacy training and technology education for adults and seniors."}),
            Expense(description="Internet connectivity equipment", amount=800.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Internet equipment supports digital literacy training and technology access for underserved populations."}),
            Expense(description="Digital literacy curriculum materials", amount=300.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Curriculum materials support digital literacy education and structured learning programs."}),
            Expense(description="Instructor training and certification", amount=600.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Instructor training improves digital literacy program quality and educational effectiveness."}),
            Expense(description="Software licenses for educational use", amount=500.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Software licenses support digital literacy training and educational technology access."}),
            Expense(description="Tablet computers for mobile learning", amount=2000.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Tablets support digital literacy training and provide accessible technology for seniors and adults."}),
            Expense(description="Technical support and maintenance", amount=400.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Technical support ensures digital literacy program sustainability and equipment functionality."}),
            Expense(description="Digital safety and security training materials", amount=200.00, grant_id=digital_grant.id, submitter_id=patricia_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Safety training materials support digital literacy education and online security awareness."}),
            
            # Food Security Initiative expenses (8 expenses)
            Expense(description="Food pantry refrigeration equipment", amount=1500.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Refrigeration equipment supports food security initiatives and food storage for underserved populations."}),
            Expense(description="Community garden tools and supplies", amount=400.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Garden supplies support food security through community food production and sustainable agriculture."}),
            Expense(description="Nutrition education materials", amount=250.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Nutrition education supports food security through healthy eating education and food literacy."}),
            Expense(description="Food distribution transportation", amount=600.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Transportation supports food security initiatives and food access for underserved populations."}),
            Expense(description="Volunteer coordination and training", amount=300.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Volunteer training supports food security program implementation and community engagement."}),
            Expense(description="Food storage and packaging supplies", amount=350.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Storage supplies support food security through proper food handling and preservation."}),
            Expense(description="Community kitchen equipment", amount=800.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Kitchen equipment supports food security through community food preparation and cooking education."}),
            Expense(description="Food rescue program coordination", amount=500.00, grant_id=food_grant.id, submitter_id=thomas_admin.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Food rescue coordination supports food security through food waste reduction and redistribution."}),
            
            # Mental Health Support expenses (6 expenses)
            Expense(description="Licensed therapist counseling services", amount=3000.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Licensed therapy services provide essential mental health support for vulnerable populations."}),
            Expense(description="Mental health education materials", amount=400.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Education materials support mental health awareness and community education for vulnerable populations."}),
            Expense(description="Support group coordination", amount=600.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Support group coordination provides peer support and mental health resources for vulnerable populations."}),
            Expense(description="Crisis intervention training", amount=800.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Crisis training improves mental health support capacity and emergency response for vulnerable populations."}),
            Expense(description="Wellness program supplies", amount=300.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="approved", ai_compliance_check={"is_compliant": True, "justification": "Wellness supplies support mental health through stress reduction and self-care activities."}),
            Expense(description="Professional development for mental health workers", amount=1000.00, grant_id=mental_grant.id, submitter_id=alex_ceo.id, status="pending", ai_compliance_check={"is_compliant": True, "justification": "Professional development improves mental health service quality and support for vulnerable populations."})
        ]
        
        for expense in expenses:
            db.add(expense)
        
        db.commit()
        
        # Get created expenses
        created_expenses = db.query(Expense).all()
        approved_expenses = [exp for exp in created_expenses if exp.status == "approved"]
        
        # Create comprehensive approvals for all approved expenses
        approvals = []
        for expense in approved_expenses:
            # Assign different approvers for variety
            approver = sarah_finance if expense.amount < 1000 else robert_accountant if expense.amount < 3000 else jennifer_controller
            approvals.append(Approval(expense_id=expense.id, approver_id=approver.id))
        
        for approval in approvals:
            db.add(approval)
        
        db.commit()
        
        # Create comprehensive payments for all approved expenses
        payments = []
        payment_methods = ["bank_transfer", "credit_card", "check", "paypal", "wire_transfer"]
        payment_statuses = ["completed", "pending", "processing", "failed"]
        
        for i, expense in enumerate(approved_expenses):
            # Create different payment statuses and methods for variety
            status = payment_statuses[i % len(payment_statuses)]
            method = payment_methods[i % len(payment_methods)]
            
            # Generate payment reference
            grant_prefix = expense.grant.name.split()[0][:3].upper()
            payment_ref = f"PAY-{grant_prefix}{i+1:03d}"
            
            payments.append(Payment(
                expense_id=expense.id,
                amount=expense.amount,
                payment_method=method,
                payment_reference=payment_ref,
                status=status
            ))
        
        for payment in payments:
            db.add(payment)
        
        db.commit()
        
        # Update expense statuses for paid expenses
        completed_payments = [p for p in payments if p.status == "completed"]
        for payment in completed_payments:
            expense = db.query(Expense).filter(Expense.id == payment.expense_id).first()
            if expense:
                expense.status = "paid"
        db.commit()
        
        # Create comprehensive grant proposals for demo
        proposals = [
            GrantProposal(
                title="Advanced STEM Robotics Program",
                description="A comprehensive robotics program for high school students focusing on competitive robotics, AI integration, and real-world problem solving. Students will build autonomous robots, learn machine learning basics, and compete in regional competitions.",
                requested_amount=45000.00,
                organization_name="Future Engineers Foundation",
                contact_email="grants@futureengineers.org",
                proposal_type="education",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Community Arts and Culture Center",
                description="Establishing a multi-purpose arts center that will serve as a hub for community cultural activities, art classes, performance space, and gallery exhibitions. The center will offer free and low-cost programming for all ages.",
                requested_amount=75000.00,
                organization_name="Cultural Arts Alliance",
                contact_email="info@culturalartsalliance.org",
                proposal_type="arts",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Urban Green Infrastructure Project",
                description="Implementing green infrastructure solutions including rain gardens, permeable pavements, and urban tree canopies to manage stormwater, reduce urban heat island effect, and improve air quality in underserved neighborhoods.",
                requested_amount=120000.00,
                organization_name="Green Cities Initiative",
                contact_email="projects@greencities.org",
                proposal_type="environment",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Youth Mental Health Support Network",
                description="Creating a comprehensive mental health support system for teenagers including peer counseling training, mental health first aid certification, crisis intervention resources, and community awareness campaigns.",
                requested_amount=60000.00,
                organization_name="Youth Wellness Coalition",
                contact_email="support@youthwellness.org",
                proposal_type="health",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Digital Equity and Inclusion Program",
                description="Bridging the digital divide by providing free internet access, device lending programs, digital literacy training, and technical support for seniors and low-income families in rural and urban areas.",
                requested_amount=85000.00,
                organization_name="Digital Access Foundation",
                contact_email="connect@digitalaccess.org",
                proposal_type="technology",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Sustainable Food Systems Initiative",
                description="Developing local food systems through community gardens, food waste reduction programs, nutrition education, and partnerships with local farmers to increase food security and promote healthy eating.",
                requested_amount=95000.00,
                organization_name="Sustainable Food Network",
                contact_email="grow@sustainablefood.org",
                proposal_type="food_security",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Elder Care Technology Integration",
                description="Implementing technology solutions to improve quality of life for elderly residents including telehealth services, smart home adaptations, social connection platforms, and caregiver support systems.",
                requested_amount=55000.00,
                organization_name="Senior Care Innovation",
                contact_email="care@seniorinnovation.org",
                proposal_type="health",
                status="pending",
                ai_compliance_score=0.0
            ),
            GrantProposal(
                title="Community Resilience and Disaster Preparedness",
                description="Building community resilience through disaster preparedness training, emergency response coordination, resource stockpiling, and community communication networks to better respond to natural disasters and emergencies.",
                requested_amount=110000.00,
                organization_name="Resilient Communities Alliance",
                contact_email="prepare@resilientcommunities.org",
                proposal_type="community_development",
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
