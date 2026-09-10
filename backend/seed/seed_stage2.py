"""
seed/seed_stage2.py — Stage 2 Reference Data & Institutional Seed Script.

Seeds:
1. Official 24 Jharkhand Districts (neutral base_urgency = 1.0)
2. Authentic Jharkhand Higher-Education Institutions & Established Departments
3. University Expertise with explicit OFFICIAL_DEPARTMENT vs PROTOTYPE_METADATA source tags
4. Clearly labeled demo challenges ([DEMO DATA])
"""
import sys
import uuid
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models.district import District
from app.models.university import University, UniversityExpertise
from app.models.challenge import Challenge, AIPrediction, ChallengeStatus, PriorityLabel
from app.models.user import User, UserRole

# Official 24 Jharkhand Districts Reference Data
JHARKHAND_DISTRICTS_DATA = [
    {"id": "ranchi", "name": "Ranchi", "hindi": "राँची", "division": "South Chota Nagpur", "hq": "Ranchi", "lat": 23.3441, "lng": 85.3096},
    {"id": "dhanbad", "name": "Dhanbad", "hindi": "धनबाद", "division": "North Chota Nagpur", "hq": "Dhanbad", "lat": 23.7957, "lng": 86.4304},
    {"id": "purbi_singhbhum", "name": "Purbi Singhbhum", "hindi": "पूर्वी सिंहभूम", "division": "Kolhan", "hq": "Jamshedpur", "lat": 22.8046, "lng": 86.2029},
    {"id": "hazaribagh", "name": "Hazaribagh", "hindi": "हजारीबाग", "division": "North Chota Nagpur", "hq": "Hazaribagh", "lat": 23.9925, "lng": 85.3637},
    {"id": "bokaro", "name": "Bokaro", "hindi": "बोकारो", "division": "North Chota Nagpur", "hq": "Bokaro Steel City", "lat": 23.6693, "lng": 86.1511},
    {"id": "giridih", "name": "Giridih", "hindi": "गिरिडीह", "division": "North Chota Nagpur", "hq": "Giridih", "lat": 24.1843, "lng": 86.3045},
    {"id": "gumla", "name": "Gumla", "hindi": "गुमला", "division": "South Chota Nagpur", "hq": "Gumla", "lat": 23.0410, "lng": 84.5412},
    {"id": "palamu", "name": "Palamu", "hindi": "पलामू", "division": "Palamu", "hq": "Medininagar (Daltonganj)", "lat": 24.0480, "lng": 84.0728},
    {"id": "deoghar", "name": "Deoghar", "hindi": "देवघर", "division": "Santhal Pargana", "hq": "Deoghar", "lat": 24.4826, "lng": 86.6967},
    {"id": "dumka", "name": "Dumka", "hindi": "दुमका", "division": "Santhal Pargana", "hq": "Dumka", "lat": 24.2676, "lng": 87.2498},
    {"id": "paschimi_singhbhum", "name": "Paschimi Singhbhum", "hindi": "पश्चिमी सिंहभूम", "division": "Kolhan", "hq": "Chaibasa", "lat": 22.5539, "lng": 85.8078},
    {"id": "ramgarh", "name": "Ramgarh", "hindi": "रामगढ़", "division": "North Chota Nagpur", "hq": "Ramgarh", "lat": 23.6288, "lng": 85.5173},
    {"id": "lohardaga", "name": "Lohardaga", "hindi": "लोहरदगा", "division": "South Chota Nagpur", "hq": "Lohardaga", "lat": 23.4334, "lng": 84.6806},
    {"id": "simdega", "name": "Simdega", "hindi": "सिमडेगा", "division": "South Chota Nagpur", "hq": "Simdega", "lat": 22.6163, "lng": 84.5098},
    {"id": "khunti", "name": "Khunti", "hindi": "खूँटी", "division": "South Chota Nagpur", "hq": "Khunti", "lat": 23.0768, "lng": 85.2796},
    {"id": "koderma", "name": "Koderma", "hindi": "कोडरमा", "division": "North Chota Nagpur", "hq": "Koderma", "lat": 24.4674, "lng": 85.5938},
    {"id": "chatra", "name": "Chatra", "hindi": "चतरा", "division": "North Chota Nagpur", "hq": "Chatra", "lat": 24.2104, "lng": 84.8710},
    {"id": "garhwa", "name": "Garhwa", "hindi": "गढ़वा", "division": "Palamu", "hq": "Garhwa", "lat": 24.1610, "lng": 83.8078},
    {"id": "latehar", "name": "Latehar", "hindi": "लातेहार", "division": "Palamu", "hq": "Latehar", "lat": 23.7437, "lng": 84.4671},
    {"id": "godda", "name": "Godda", "hindi": "गोड्डा", "division": "Santhal Pargana", "hq": "Godda", "lat": 24.8267, "lng": 87.2131},
    {"id": "sahibganj", "name": "Sahibganj", "hindi": "साहिबगंज", "division": "Santhal Pargana", "hq": "Sahibganj", "lat": 25.2425, "lng": 87.6416},
    {"id": "pakur", "name": "Pakur", "hindi": "पाकुड़", "division": "Santhal Pargana", "hq": "Pakur", "lat": 24.6344, "lng": 87.8488},
    {"id": "jamtara", "name": "Jamtara", "hindi": "जामताड़ा", "division": "Santhal Pargana", "hq": "Jamtara", "lat": 23.9619, "lng": 86.8041},
    {"id": "saraikela_kharsawan", "name": "Saraikela Kharsawan", "hindi": "सरायकेला खरसावां", "division": "Kolhan", "hq": "Saraikela", "lat": 22.6997, "lng": 85.9304},
]

# Authentic Jharkhand Higher-Education Institutions
INSTITUTIONS_DATA = [
    {
        "name": "Birla Institute of Technology, Mesra (BIT Mesra)",
        "short_name": "BIT Mesra",
        "type": "Deemed University / Institute of Eminence",
        "city": "Ranchi",
        "district_id": "ranchi",
        "expertise": [
            {"domain": "Water & Sanitation", "subdomain": "Fluoride Filtration & Jal Jeevan R&D", "score": 9.5, "derivation": "Established Dept of Chemical Engg & Jal Mission Lab"},
            {"domain": "Infrastructure", "subdomain": "Smart Rural Grid & GIS Systems", "score": 9.0, "derivation": "Dept of Civil & Remote Sensing"},
            {"domain": "Governance / Public Services", "subdomain": "AI Governance & e-Panchayat Systems", "score": 8.8, "derivation": "Dept of Computer Science & AI"},
        ]
    },
    {
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "short_name": "IIT (ISM) Dhanbad",
        "type": "Institute of National Importance",
        "city": "Dhanbad",
        "district_id": "dhanbad",
        "expertise": [
            {"domain": "Environment", "subdomain": "Mine Land Reclamation & Heavy Metal Removal", "score": 9.8, "derivation": "Established Dept of Environmental Science & Engineering"},
            {"domain": "Water & Sanitation", "subdomain": "Industrial Effluent & Groundwater Hydrology", "score": 9.2, "derivation": "Dept of Applied Geophysics & Hydrogeology"},
            {"domain": "Infrastructure", "subdomain": "Sustainable Mining & Slope Stability", "score": 9.6, "derivation": "Dept of Mining Engineering"},
        ]
    },
    {
        "name": "National Institute of Technology Jamshedpur (NIT Jamshedpur)",
        "short_name": "NIT Jamshedpur",
        "type": "Institute of National Importance",
        "city": "Jamshedpur",
        "district_id": "purbi_singhbhum",
        "expertise": [
            {"domain": "Infrastructure", "subdomain": "Bridge Engineering & Low-Cost Materials", "score": 9.3, "derivation": "Established Dept of Civil & Mechanical Engineering"},
            {"domain": "Healthcare", "subdomain": "Medical Devices & Mechatronics", "score": 8.7, "derivation": "Dept of Electrical Engineering & Bio-Mechatronics"},
            {"domain": "Water & Sanitation", "subdomain": "Urban Drainage & Wastewater Treatment", "score": 8.9, "derivation": "Dept of Civil Engineering"},
        ]
    },
    {
        "name": "Birsa Agricultural University (BAU)",
        "short_name": "BAU Kanke",
        "type": "State Agricultural University",
        "city": "Ranchi",
        "district_id": "ranchi",
        "expertise": [
            {"domain": "Agriculture", "subdomain": "Drought-Resistant Tribal Crops & Soil Health", "score": 9.7, "derivation": "Established Faculty of Agriculture & Soil Science"},
            {"domain": "Livelihood", "subdomain": "Agro-Forestry & Lac Production Technologies", "score": 9.5, "derivation": "Faculty of Forestry & Post-Harvest Tech"},
            {"domain": "Water & Sanitation", "subdomain": "Micro-Irrigation & Farm Pond Systems", "score": 8.9, "derivation": "College of Agricultural Engineering"},
        ]
    },
    {
        "name": "Central University of Jharkhand (CUJ)",
        "short_name": "CUJ Brambe",
        "type": "Central University",
        "city": "Ranchi",
        "district_id": "ranchi",
        "expertise": [
            {"domain": "Environment", "subdomain": "Tribal Ecology & Forest Resource Management", "score": 9.1, "derivation": "Dept of Environmental Sciences"},
            {"domain": "Education", "subdomain": "Tribal Linguistics & Multilingual Education", "score": 9.4, "derivation": "Dept of Tribal Studies & Languages"},
            {"domain": "Governance / Public Services", "subdomain": "Public Policy & Rural Development", "score": 8.6, "derivation": "Centre for Far East Languages & Policy"},
        ]
    },
    {
        "name": "Ranchi University",
        "short_name": "Ranchi University",
        "type": "State University",
        "city": "Ranchi",
        "district_id": "ranchi",
        "expertise": [
            {"domain": "Healthcare", "subdomain": "Community Health & Herbal Medicine", "score": 8.5, "derivation": "Dept of Botany & Indigenous Knowledge Systems"},
            {"domain": "Livelihood", "subdomain": "Self-Help Group Skill Development", "score": 8.4, "derivation": "School of Vocational Studies"},
        ]
    }
]


def seed():
    db = SessionLocal()
    try:
        print("[1/4] Seeding 24 Official Jharkhand Districts (Neutral Base Urgency = 1.0)...")
        for d_data in JHARKHAND_DISTRICTS_DATA:
            existing = db.query(District).filter(District.id == d_data["id"]).first()
            if not existing:
                dist = District(
                    id=d_data["id"],
                    name=d_data["name"],
                    hindi_name=d_data["hindi"],
                    division=d_data["division"],
                    hq=d_data["hq"],
                    base_urgency=1.0, # Neutral baseline (PROTOTYPE METADATA)
                    latitude=d_data["lat"],
                    longitude=d_data["lng"]
                )
                db.add(dist)
        db.commit()
        print("     -> 24 districts seeded/verified successfully.")

        print("[2/4] Seeding Authentic Jharkhand Higher Education Institutions & Departments...")
        for inst in INSTITUTIONS_DATA:
            univ = db.query(University).filter(University.name == inst["name"]).first()
            if not univ:
                univ = University(
                    name=inst["name"],
                    short_name=inst["short_name"],
                    type=inst["type"],
                    city=inst["city"],
                    district_id=inst["district_id"],
                    state="Jharkhand",
                    active_capacity=12, # PROTOTYPE METADATA
                    current_load=3,      # PROTOTYPE METADATA
                    is_active=True
                )
                db.add(univ)
                db.flush()

                # Add expertise records
                for exp in inst["expertise"]:
                    e_rec = UniversityExpertise(
                        university_id=univ.id,
                        domain=exp["domain"],
                        subdomain=exp["subdomain"],
                        score=exp["score"],
                        source_type="OFFICIAL_DEPARTMENT",
                        derivation_notes=exp["derivation"]
                    )
                    db.add(e_rec)
        db.commit()
        print("     -> Authentic institutions and expertise records seeded.")

        print("[3/4] Fetching test citizen user...")
        citizen_user = db.query(User).filter(User.role == UserRole.citizen).first()
        if not citizen_user:
            print("     -> Warning: No citizen user found. Run Stage 1 test script first.")
            return

        print("[4/4] Seeding [DEMO DATA] Baseline Challenge for Duplicate Detection Testing...")
        demo_short_id = "JH-2026-DEMO-001"
        existing_demo = db.query(Challenge).filter(Challenge.short_id == demo_short_id).first()
        if not existing_demo:
            demo_ch = Challenge(
                short_id=demo_short_id,
                title="[DEMO DATA] High Fluoride Concentration in Village Handpumps",
                description="Severe fluoride contamination reported in rural handpumps affecting children with dental and skeletal fluorosis. Need low-cost filtration unit.",
                category="Water",
                district_id="gumla",
                block_locality="Gumla Rural Block, Ward 3",
                latitude=23.0410,
                longitude=84.5412,
                affected_population=140,
                citizen_severity=4,
                submitter_id=citizen_user.id,
                submitter_type="Gram Panchayat",
                submitter_name="Demographic Sample Panchayat",
                original_language="en",
                status=ChallengeStatus.UNDER_REVIEW
            )
            db.add(demo_ch)
            db.flush()

            # Seed AI Prediction for demo challenge
            demo_ai = AIPrediction(
                challenge_id=demo_ch.id,
                primary_sector="Water & Sanitation",
                subcategory="Groundwater Contamination",
                priority_score=78.0,
                priority_label=PriorityLabel.HIGH,
                keywords=["fluoride", "handpump", "contamination", "drinking water", "health risk"],
                suggested_domain="Water & Sanitation",
                duplicate_flag=False,
                similarity_score=0.0,
                similar_challenge_ids=[],
                recommended_universities=[
                    {
                        "university_name": "BIT Mesra",
                        "match_score": 96.0,
                        "explanation": "Established Dept of Chemical Engg & Jal Mission Lab + same administrative division.",
                        "metadata_source": "OFFICIAL_DEPARTMENT"
                    }
                ],
                overall_explanation="High priority due to contaminated drinking water reported, affecting 140 villagers.",
                model_version="rule-hybrid-v1"
            )
            db.add(demo_ai)
            db.commit()
            print("     -> [DEMO DATA] Challenge seeded.")
        else:
            print("     -> [DEMO DATA] Challenge already exists.")

        print("==================================================")
        print("  STAGE 2 SEED COMPLETED CLEANLY!")
        print("==================================================")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
