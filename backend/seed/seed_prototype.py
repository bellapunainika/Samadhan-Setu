"""
seed/seed_prototype.py — Master reproducible prototype database seeder for Samadhan Setu.
Seeds PostgreSQL with:
- 24 Jharkhand Districts
- Authentic Jharkhand Institutions
- 6 Demo Accounts (Citizen, University A, University B, Industry, Admin, Govt Officer)
- 12 Controlled Demo Challenges across all workflow stages
- AIPredictions, Assignments, Team details, Progress updates, Solutions, Industry requests, Queries, and Audit history.
"""
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import text
from app.database import engine, SessionLocal, Base
from app.models.user import User, UserRole
from app.models.district import District
from app.models.university import University, UniversityExpertise
from app.models.challenge import Challenge, ChallengeEvidence, AIPrediction, ChallengeStatus, PriorityLabel
from app.models.assignment import ChallengeAssignment
from app.models.progress import ProgressUpdate
from app.models.solution import SolutionSubmission, SolutionStatus
from app.models.industry import IndustryInterest, IndustryInterestStatus
from app.models.query import ChallengeQuery, QueryStatus
from app.models.audit import AdminAction
from app.auth.password import hash_password

import sys

def seed_database():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("==================================================")
    print("  SAMADHAN SETU — PROTOTYPE DATABASE SEEDER")
    print("==================================================")

    # 1. Ensure Schema
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'officer';"))
        conn.execute(text("ALTER TYPE challengestatus ADD VALUE IF NOT EXISTS 'SOLUTION_APPROVED';"))
        conn.execute(text("ALTER TYPE challengestatus ADD VALUE IF NOT EXISTS 'COMPLETED';"))
        for val in ['FUNDING_INTEREST', 'PROPOSAL_INITIATED', 'PROPOSAL_UNDER_DISCUSSION', 'SUPPORT_CONFIRMED', 'FUNDING_CONFIRMED', 'PROJECT_FUNDED']:
            conn.execute(text(f"ALTER TYPE industryintereststatus ADD VALUE IF NOT EXISTS '{val}';"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);"))
        conn.execute(text("ALTER TABLE challenge_assignments ADD COLUMN IF NOT EXISTS team_name VARCHAR(255);"))
        conn.execute(text("ALTER TABLE challenge_assignments ADD COLUMN IF NOT EXISTS faculty_mentor VARCHAR(255);"))
        conn.execute(text("ALTER TABLE challenge_assignments ADD COLUMN IF NOT EXISTS student_members TEXT;"))
        conn.execute(text("ALTER TABLE industry_interests ADD COLUMN IF NOT EXISTS pledged_amount VARCHAR(100);"))
        conn.execute(text("ALTER TABLE industry_interests ADD COLUMN IF NOT EXISTS proposal_summary TEXT;"))
        conn.execute(text("ALTER TABLE industry_interests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;"))
        conn.execute(text("ALTER TABLE industry_interests ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;"))
        conn.commit()

    db = SessionLocal()

    try:
        # Clear previous records for clean deterministic seed
        print("[1/5] Cleaning existing prototype tables...")
        db.query(ChallengeQuery).delete()
        db.query(AdminAction).delete()
        db.query(IndustryInterest).delete()
        db.query(SolutionSubmission).delete()
        db.query(ProgressUpdate).delete()
        db.query(ChallengeAssignment).delete()
        db.query(ChallengeEvidence).delete()
        db.query(AIPrediction).delete()
        db.query(Challenge).delete()
        db.query(User).delete()
        db.query(UniversityExpertise).delete()
        db.query(University).delete()
        db.query(District).delete()
        db.commit()

        # 2. Seed 24 Jharkhand Districts
        print("[2/5] Seeding 24 Jharkhand Districts...")
        districts_data = [
            ("ranchi", "Ranchi", "राँची", "South Chotanagpur", "Ranchi", 1.0, 23.3441, 85.3096),
            ("dhanbad", "Dhanbad", "धनबाद", "North Chotanagpur", "Dhanbad", 1.0, 23.7957, 86.4304),
            ("east_singhbhum", "East Singhbhum", "पूर्वी सिंहभूम", "Kolhan", "Jamshedpur", 1.0, 22.8046, 86.2029),
            ("bokaro", "Bokaro", "बोकारो", "North Chotanagpur", "Bokaro Steel City", 1.0, 23.6693, 86.1511),
            ("hazaribagh", "Hazaribagh", "हजारीबाग", "North Chotanagpur", "Hazaribagh", 1.0, 23.9925, 85.3637),
            ("deoghar", "Deoghar", "देवघर", "Santhal Pargana", "Deoghar", 1.0, 24.4826, 86.6967),
            ("dumka", "Dumka", "दुमका", "Santhal Pargana", "Dumka", 1.0, 24.2676, 87.2497),
            ("giridih", "Giridih", "गिरिडीह", "North Chotanagpur", "Giridih", 1.0, 24.1804, 86.3040),
            ("ramgarh", "Ramgarh", "रामगढ़", "North Chotanagpur", "Ramgarh Cantt", 1.0, 23.6300, 85.5100),
            ("gumla", "Gumla", "गुमला", "South Chotanagpur", "Gumla", 1.0, 23.0425, 84.5422),
            ("khunti", "Khunti", "खूंटी", "South Chotanagpur", "Khunti", 1.0, 23.0725, 85.2786),
            ("sahebganj", "Sahebganj", "साहिबगंज", "Santhal Pargana", "Sahebganj", 1.0, 25.2444, 87.6444),
            ("palamu", "Palamu", "पलामू", "Palamu", "Medininagar", 1.0, 24.0494, 84.0725),
            ("west_singhbhum", "West Singhbhum", "पश्चिमी सिंहभूम", "Kolhan", "Chaibasa", 1.0, 22.5627, 85.8118),
            ("simdega", "Simdega", "सिमडेगा", "South Chotanagpur", "Simdega", 1.0, 22.6150, 84.5083),
            ("lohardaga", "Lohardaga", "लोहरदगा", "South Chotanagpur", "Lohardaga", 1.0, 23.4319, 84.6800),
            ("latehar", "Latehar", "लातेहार", "Palamu", "Latehar", 1.0, 23.7431, 84.5028),
            ("chatra", "Chatra", "चतरा", "North Chotanagpur", "Chatra", 1.0, 24.2094, 84.8719),
            ("koderma", "Koderma", "कोडरमा", "North Chotanagpur", "Koderma", 1.0, 24.4672, 85.5939),
            ("jamtara", "Jamtara", "जामताड़ा", "Santhal Pargana", "Jamtara", 1.0, 23.9619, 86.8028),
            ("pakur", "Pakur", "पाकुड़", "Santhal Pargana", "Pakur", 1.0, 24.6369, 87.8481),
            ("godda", "Godda", "गोड्डा", "Santhal Pargana", "Godda", 1.0, 24.8267, 87.2147),
            ("garhwa", "Garhwa", "गढ़वा", "Palamu", "Garhwa", 1.0, 24.1608, 83.8078),
            ("saraikela_kharsawan", "Saraikela Kharsawan", "सरायकेला खरसावां", "Kolhan", "Saraikela", 1.0, 22.7000, 85.9300),
        ]
        dist_objs = {}
        for d_id, d_name, d_hname, d_div, d_hq, b_urg, lat, lng in districts_data:
            d = District(id=d_id, name=d_name, hindi_name=d_hname, division=d_div, hq=d_hq, base_urgency=b_urg, latitude=lat, longitude=lng)
            db.add(d)
            dist_objs[d_id] = d
        db.commit()

        # 3. Seed Authentic Jharkhand Institutions
        print("[3/5] Seeding Authentic Jharkhand Universities...")
        u1 = University(
            name="Birla Institute of Technology, Mesra",
            short_name="BIT Mesra",
            type="Deemed University",
            district_id="ranchi",
            city="Ranchi",
            state="Jharkhand",
            active_capacity=10,
            current_load=3,
            is_active=True
        )
        u2 = University(
            name="Indian Institute of Technology (ISM), Dhanbad",
            short_name="IIT (ISM) Dhanbad",
            type="Institute of National Importance",
            district_id="dhanbad",
            city="Dhanbad",
            state="Jharkhand",
            active_capacity=12,
            current_load=4,
            is_active=True
        )
        u3 = University(
            name="National Institute of Technology, Jamshedpur",
            short_name="NIT Jamshedpur",
            type="Institute of National Importance",
            district_id="east_singhbhum",
            city="Jamshedpur",
            state="Jharkhand",
            active_capacity=8,
            current_load=2,
            is_active=True
        )
        u4 = University(
            name="Birsa Agricultural University",
            short_name="BAU Ranchi",
            type="State Agricultural University",
            district_id="ranchi",
            city="Ranchi",
            state="Jharkhand",
            active_capacity=8,
            current_load=1,
            is_active=True
        )
        u5 = University(
            name="Ranchi University",
            short_name="Ranchi Univ",
            type="State Public University",
            district_id="ranchi",
            city="Ranchi",
            state="Jharkhand",
            active_capacity=10,
            current_load=2,
            is_active=True
        )
        db.add_all([u1, u2, u3, u4, u5])
        db.commit()
        db.refresh(u1)
        db.refresh(u2)
        db.refresh(u3)
        db.refresh(u4)
        db.refresh(u5)

        # Seed University Expertise
        exp_records = [
            UniversityExpertise(university_id=u1.id, domain="Water & Sanitation", subdomain="Fluoride & Heavy Metal Remediation", score=9.5, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Department of Chemical Engineering & Environmental Science"),
            UniversityExpertise(university_id=u1.id, domain="Renewable Energy & Grids", subdomain="Solar Microgrids", score=9.2, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Electrical & Electronics Engineering"),
            UniversityExpertise(university_id=u1.id, domain="Agriculture", subdomain="Cold Storage & Agri-Tech", score=8.5, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Bio-Engineering Department"),
            UniversityExpertise(university_id=u2.id, domain="Mining & Energy", subdomain="Mine Safety & Methane Monitoring", score=9.8, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Department of Mining Engineering"),
            UniversityExpertise(university_id=u2.id, domain="Environment", subdomain="Acid Mine Drainage & Bio-Remediation", score=9.2, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Environmental Science & Engineering"),
            UniversityExpertise(university_id=u2.id, domain="Water & Sanitation", subdomain="Industrial Wastewater Treatment", score=8.8, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Department of Civil Engineering"),
            UniversityExpertise(university_id=u3.id, domain="Infrastructure", subdomain="Structural Engineering", score=9.0, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Civil Engineering Dept"),
            UniversityExpertise(university_id=u4.id, domain="Agriculture", subdomain="Crop Protection & Hydroponics", score=9.8, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Faculty of Agriculture"),
            UniversityExpertise(university_id=u5.id, domain="Education", subdomain="Tribal Education & Languages", score=8.5, source_type="OFFICIAL_DEPARTMENT", derivation_notes="Department of Tribal Studies")
        ]
        db.add_all(exp_records)
        db.commit()

        # 4. Seed 6 Demo Accounts
        print("[4/5] Seeding 6 Authentic Demo Role Accounts...")
        hashed_pass = hash_password("Password123!")
        admin_pass = hash_password("Nainika@00")

        usr_citizen = User(
            email="citizen@samadhan.gov.in",
            hashed_password=hashed_pass,
            full_name="Ranchi Citizen Tester",
            role=UserRole.citizen,
            district_id="ranchi",
            phone="9876543210"
        )
        usr_univ_a = User(
            email="solver@bitmesra.ac.in",
            hashed_password=hashed_pass,
            full_name="Dr. Alok Verma (BIT Mesra)",
            role=UserRole.university,
            organization="BIT Mesra",
            university_id=u1.id
        )
        usr_univ_b = User(
            email="solver@iitdhanbad.ac.in",
            hashed_password=hashed_pass,
            full_name="Prof. S. K. Sinha (IIT Dhanbad)",
            role=UserRole.university,
            organization="IIT (ISM) Dhanbad",
            university_id=u2.id
        )
        usr_industry = User(
            email="csr@tatasteel.com",
            hashed_password=hashed_pass,
            full_name="Tata Steel CSR Lead",
            role=UserRole.industry,
            organization="Tata Steel CSR Foundation"
        )
        usr_admin = User(
            email="admin@samadhan.gov.in",
            hashed_password=admin_pass,
            full_name="State Nodal Governance Admin",
            role=UserRole.admin,
            organization="Government of Jharkhand"
        )
        usr_officer = User(
            email="officer@samadhan.gov.in",
            hashed_password=hashed_pass,
            full_name="Department Nodal Oversight Officer",
            role=UserRole.officer,
            organization="Department of Higher & Technical Education"
        )
        db.add_all([usr_citizen, usr_univ_a, usr_univ_b, usr_industry, usr_admin, usr_officer])
        db.commit()
        for u in [usr_citizen, usr_univ_a, usr_univ_b, usr_industry, usr_admin, usr_officer]:
            db.refresh(u)

        # 5. Seed 12 Controlled Demo Challenges across all stages
        print("[5/5] Seeding 12 Controlled Demo Challenges across full workflow...")

        now = datetime.now(timezone.utc)

        # Challenge Helper
        def create_demo_ch(short_id, title, desc, cat, dist, locality, pop, sev, status, submitter=usr_citizen):
            c = Challenge(
                short_id=short_id,
                title=title,
                description=desc,
                category=cat,
                district_id=dist,
                block_locality=locality,
                affected_population=pop,
                citizen_severity=sev,
                submitter_id=submitter.id,
                submitter_name=submitter.full_name,
                submitter_type="Gram Panchayat / Citizen",
                status=status,
                created_at=now - timedelta(days=10),
                updated_at=now - timedelta(days=1)
            )
            db.add(c)
            db.commit()
            db.refresh(c)

            # AIPrediction
            ai = AIPrediction(
                challenge_id=c.id,
                primary_sector=cat,
                priority_score=85.0 if sev >= 4 else 60.0,
                priority_label=PriorityLabel.CRITICAL if sev >= 5 else PriorityLabel.HIGH,
                keywords=[cat.lower(), dist, "jharkhand", "community"],
                suggested_domain="Environmental Engineering",
                duplicate_flag=(short_id == "JH-2026-DEMO-002"),
                similarity_score=92.5 if short_id == "JH-2026-DEMO-002" else 0.0,
                similar_challenge_ids=["JH-2026-DEMO-001"] if short_id == "JH-2026-DEMO-002" else [],
                recommended_universities=[
                    {"university_id": str(u1.id), "university_name": u1.name, "score": 95.0, "reason": "Top expertise in Water & Sanitation"},
                    {"university_id": str(u2.id), "university_name": u2.name, "score": 88.0, "reason": "Advanced Chemical Filtration Lab"},
                    {"university_id": str(u3.id), "university_name": u3.name, "score": 82.0, "reason": "Environmental Engineering Dept"}
                ],
                overall_explanation=f"High priority grassroots challenge detected in {dist} district. Recommended for academic R&D allocation."
            )
            db.add(ai)
            db.commit()
            return c

        # 1. UNDER_REVIEW (2 items)
        c1 = create_demo_ch("JH-2026-DEMO-001", "Fluoride Contamination in Handpump Water", "Drinking water from rural handpumps has high fluoride levels causing skeletal fluorosis in children.", "Water", "gumla", "Dumri Block, Ward 4", 180, 5, ChallengeStatus.UNDER_REVIEW)
        c2 = create_demo_ch("JH-2026-DEMO-002", "Excessive Fluoride in Village Handpumps", "Drinking water from rural handpumps has high fluoride levels causing fluorosis in children.", "Water", "gumla", "Dumri Block, Ward 5", 150, 5, ChallengeStatus.UNDER_REVIEW)

        # 2. ASSIGNED (2 items)
        c3 = create_demo_ch("JH-2026-DEMO-003", "Solar Microgrid for Tribal Village Electrification", "Remote tribal settlement requires decentralized solar microgrid for nighttime lighting and agricultural pumps.", "Energy", "ranchi", "Kanke Ward 2", 220, 4, ChallengeStatus.ASSIGNED)
        a3 = ChallengeAssignment(challenge_id=c3.id, university_id=u1.id, assigned_by=usr_admin.id, notes="Assigned to BIT Mesra Renewable Energy Center.")
        db.add(a3)

        c4 = create_demo_ch("JH-2026-DEMO-004", "Methane Hazard Monitoring in Abandoned Coal Mines", "Unmonitored methane buildup in abandoned mine pits poses explosion risk to nearby settlements.", "Mining & Energy", "dhanbad", "Jharia Sector 3", 500, 5, ChallengeStatus.ASSIGNED)
        a4 = ChallengeAssignment(challenge_id=c4.id, university_id=u2.id, assigned_by=usr_admin.id, notes="Assigned to IIT (ISM) Dhanbad Mine Safety Dept.")
        db.add(a4)

        # 3. IN_PROGRESS (2 items)
        c5 = create_demo_ch("JH-2026-DEMO-005", "Cold Chain Preservation for Tribal Lac & Forest Produce", "Tribal harvesters lose 40% of perishable forest produce due to lack of solar cold storage units.", "Agriculture", "khunti", "Torpa Block", 310, 4, ChallengeStatus.IN_PROGRESS)
        a5 = ChallengeAssignment(
            challenge_id=c5.id,
            university_id=u1.id,
            assigned_by=usr_admin.id,
            team_name="BIT Green Energy Team",
            faculty_mentor="Prof. Alok Verma",
            student_members="Rahul Sharma (M.Tech), Priya Singh (B.Tech)",
            started_at=now - timedelta(days=5)
        )
        db.add(a5)
        p5 = ProgressUpdate(challenge_id=c5.id, university_id=u1.id, posted_by=usr_univ_a.id, title="Phase 1 Solar Thermal Design Complete", description="Engineered 500L solar thermal cold storage prototype tested under ambient 38°C.", progress_percent=45.0)
        db.add(p5)

        c6 = create_demo_ch("JH-2026-DEMO-006", "Automated Slope Stability Sensors for Open-Cast Mines", "Landslide risks in open-cast mining pits require IoT tilt sensor monitoring.", "Mining & Energy", "ramgarh", "Patratu Industrial Region", 400, 4, ChallengeStatus.IN_PROGRESS)
        a6 = ChallengeAssignment(
            challenge_id=c6.id,
            university_id=u2.id,
            assigned_by=usr_admin.id,
            team_name="IIT MineTech Lab",
            faculty_mentor="Prof. S. K. Sinha",
            student_members="Amit Kumar (PhD), Sonal Gupta (M.Tech)",
            started_at=now - timedelta(days=6)
        )
        db.add(a6)

        # 4. SOLUTION_SUBMITTED (2 items)
        c7 = create_demo_ch("JH-2026-DEMO-007", "IoT Low-Cost Arsenic Water Filtration Unit", "Groundwater in Sahebganj contains dangerous arsenic levels. Urgent filtration prototype required.", "Water", "sahebganj", "Rajmahal Block", 600, 5, ChallengeStatus.SOLUTION_SUBMITTED)
        a7 = ChallengeAssignment(challenge_id=c7.id, university_id=u1.id, assigned_by=usr_admin.id)
        db.add(a7)
        s7 = SolutionSubmission(
            challenge_id=c7.id,
            university_id=u1.id,
            submitted_by=usr_univ_a.id,
            title="Bio-Char Nanofiltration Water Unit",
            description="Multi-stage activated bio-char and iron oxide nanoparticle filter removing 99.4% arsenic at ₹0.05/liter.",
            prototype_url="https://github.com/jh-innovation/arsenic-filter-proto",
            technology_stack="Activated Bio-Char + IoT Water Quality Sensor",
            status=SolutionStatus.PENDING_REVIEW
        )
        db.add(s7)

        c8 = create_demo_ch("JH-2026-DEMO-008", "Bio-Remediation of Acid Mine Drainage", "Coal run-off acidifying local streams and agricultural soil in West Singhbhum.", "Environment", "west_singhbhum", "Noamundi Region", 350, 4, ChallengeStatus.SOLUTION_SUBMITTED)
        a8 = ChallengeAssignment(challenge_id=c8.id, university_id=u2.id, assigned_by=usr_admin.id)
        db.add(a8)
        s8 = SolutionSubmission(
            challenge_id=c8.id,
            university_id=u2.id,
            submitted_by=usr_univ_b.id,
            title="Sulfate-Reducing Bacterial Bio-Bed",
            description="Passive biological wetland filter using native sulfate-reducing bacteria to neutralize pH 3.2 stream runoff.",
            prototype_url="https://github.com/jh-innovation/bio-bed-amd",
            technology_stack="Bio-Remediation Wetland Matrix",
            status=SolutionStatus.PENDING_REVIEW
        )
        db.add(s8)

        # 5. SOLUTION_APPROVED (2 items)
        c9 = create_demo_ch("JH-2026-DEMO-009", "Mobile Solar Water Purification Bus for Disaster Zones", "Emergency mobile purification system required for flood-affected riverine hamlets.", "Water", "east_singhbhum", "Ghatshila Sub-Division", 800, 5, ChallengeStatus.SOLUTION_APPROVED)
        a9 = ChallengeAssignment(challenge_id=c9.id, university_id=u1.id, assigned_by=usr_admin.id)
        db.add(a9)
        s9 = SolutionSubmission(
            challenge_id=c9.id,
            university_id=u1.id,
            submitted_by=usr_univ_a.id,
            title="Mobile RO-Solar trailer Unit",
            description="Trailer-mounted 2000L/hr solar powered water purification unit with UV-C disinfection.",
            prototype_url="https://github.com/jh-innovation/mobile-purifier",
            technology_stack="Solar PV + Reverse Osmosis + UV-C",
            status=SolutionStatus.ACCEPTED,
            admin_feedback="Solution approved by State Technical Panel."
        )
        db.add(s9)
        ind9 = IndustryInterest(
            challenge_id=c9.id,
            industry_user_id=usr_industry.id,
            company_name="Tata Steel CSR Foundation",
            contact_email="csr@tatasteel.com",
            support_type="CSR Grant & Pilot Manufacturing",
            message="We propose a ₹15,00,000 CSR grant to manufacture 3 pilot mobile trailers for East Singhbhum district.",
            status=IndustryInterestStatus.INTEREST_EXPRESSED
        )
        db.add(ind9)

        c10 = create_demo_ch("JH-2026-DEMO-010", "Smart Hydroponic Farming for Drought-Prone Regions", "Severe water scarcity in Palamu affecting Kharif crops and farmer livelihoods.", "Agriculture", "palamu", "Daltonganj Block", 450, 4, ChallengeStatus.SOLUTION_APPROVED)
        a10 = ChallengeAssignment(challenge_id=c10.id, university_id=u1.id, assigned_by=usr_admin.id)
        db.add(a10)

        # 6. COMPLETED (1 item)
        c11 = create_demo_ch("JH-2026-DEMO-011", "Decentralized Bamboo-Based Wastewater Treatment Plant", "Untreated sewage discharging into local river ecosystem in Hazaribagh.", "Environment", "hazaribagh", "Sadat Block", 1200, 4, ChallengeStatus.COMPLETED)
        a11 = ChallengeAssignment(challenge_id=c11.id, university_id=u1.id, assigned_by=usr_admin.id)
        db.add(a11)
        ind11 = IndustryInterest(
            challenge_id=c11.id,
            industry_user_id=usr_industry.id,
            company_name="Tata Steel CSR Foundation",
            contact_email="csr@tatasteel.com",
            support_type="CSR Direct Funding",
            message="Fully funded ₹25,00,000 deployment across 5 Gram Panchayats.",
            status=IndustryInterestStatus.SUPPORT_CONFIRMED,
            admin_response="Tripartite MoU signed and funding confirmed."
        )
        db.add(ind11)

        # 7. REJECTED (1 item)
        c12 = create_demo_ch("JH-2026-DEMO-012", "Private Commercial Mall Renovation Support", "Commercial retail plaza owner requesting government technical grant for interior decor.", "General", "ranchi", "Main Road Ward 1", 5, 1, ChallengeStatus.REJECTED)

        # Queries
        q1 = ChallengeQuery(
            challenge_id=c1.id,
            sender_id=usr_citizen.id,
            sender_role="citizen",
            subject="Has a university been assigned yet?",
            message="When will the technical team start testing our village handpumps?",
            status=QueryStatus.PENDING,
            created_at=now - timedelta(days=2)
        )
        q2 = ChallengeQuery(
            challenge_id=c5.id,
            sender_id=usr_univ_a.id,
            sender_role="university",
            subject="Request for Gram Panchayat site visit permission",
            message="BIT research team requires district administrative pass for site deployment in Torpa Block.",
            status=QueryStatus.RESOLVED,
            admin_response="Pass approved and communicated to Khunti Deputy Commissioner.",
            responded_by=usr_admin.id,
            created_at=now - timedelta(days=3),
            resolved_at=now - timedelta(days=1)
        )
        db.add_all([q1, q2])

        # Audit Logs
        aud1 = AdminAction(actor_id=usr_admin.id, action_type="APPROVE_AND_ASSIGN", entity_type="CHALLENGE", entity_id=c5.short_id, new_value={"status": "ASSIGNED", "university": "BIT Mesra"}, reason="Assigned to BIT Mesra cold chain lab.")
        aud2 = AdminAction(actor_id=usr_admin.id, action_type="ACCEPT_SOLUTION", entity_type="CHALLENGE", entity_id=c9.short_id, new_value={"status": "SOLUTION_APPROVED"}, reason="Validated by State Technical Panel.")
        aud3 = AdminAction(actor_id=usr_admin.id, action_type="REVIEW_INDUSTRY_ACCEPT", entity_type="INDUSTRY_INTEREST", entity_id=str(ind11.id), new_value={"status": "ACCEPTED"}, reason="CSR partnership confirmed.")
        db.add_all([aud1, aud2, aud3])

        db.commit()
        print("==================================================")
        print("  SUCCESS: PROTOTYPE DATABASE SEEDED SUCCESSFULLY!")
        print("==================================================")
        print("  Seeded Users:")
        print("   - Citizen:            citizen@samadhan.gov.in (pass: Password123!)")
        print("   - University A:        solver@bitmesra.ac.in   (pass: Password123!)")
        print("   - University B:        solver@iitdhanbad.ac.in (pass: Password123!)")
        print("   - Industry:            csr@tatasteel.com       (pass: Password123!)")
        print("   - State Admin:         admin@samadhan.gov.in   (pass: Nainika@00)")
        print("   - Govt Officer:        officer@samadhan.gov.in (pass: Password123!)")
        print("  Seeded Challenges: 12 demo items across all workflow stages.")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
