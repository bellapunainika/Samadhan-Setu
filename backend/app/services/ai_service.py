"""
services/ai_service.py — Explainable, Deterministic, Rule-Hybrid AI Engine.

No external API calls. No random numbers. No black box.
Calculates:
1. Sector & Subcategory Classification
2. Priority Score (0-100) & Label
3. University Recommendation Match Score (0-100)
4. Duplicate Similarity Check (0-100)
"""
import re
import math
from typing import Dict, List, Any, Tuple
from sqlalchemy.orm import Session
from app.models.district import District
from app.models.university import University, UniversityExpertise
from app.models.challenge import Challenge, PriorityLabel

# ── Sector Keyword Dictionary for Deterministic Classification ────────────────
SECTOR_KEYWORDS: Dict[str, List[str]] = {
    "Water & Sanitation": [
        "water", "drinking", "handpump", "fluoride", "arsenic", "contamination",
        "borewell", "aquifer", "sanitation", "sewage", "drainage", "tap", "jal", "clean water"
    ],
    "Healthcare": [
        "health", "hospital", "phc", "doctor", "medicine", "outbreak", "malaria",
        "dengue", "ambulance", "maternal", "clinic", "disease", "fever", "epidemic"
    ],
    "Agriculture": [
        "crop", "farming", "farmer", "drought", "pest", "irrigation", "soil",
        "kisan", "yield", "paddy", "fertilizer", "harvest", "agriculture", "seed"
    ],
    "Environment": [
        "forest", "mining", "pollution", "deforestation", "waste", "heavy metal",
        "coal", "reclamation", "ecological", "wildlife", "dust", "toxic", "environment"
    ],
    "Infrastructure": [
        "road", "bridge", "electricity", "power", "culvert", "building", "grid",
        "pothole", "street light", "solar", "connectivity", "infrastructure"
    ],
    "Education": [
        "school", "teacher", "student", "classroom", "tribal language", "literacy",
        "midday meal", "education", "college", "vocational"
    ],
    "Livelihood": [
        "employment", "shg", "artisan", "lac", "tussar", "skill", "income",
        "handicraft", "forest produce", "livelihood", "job"
    ],
    "Governance / Public Services": [
        "panchayat", "ration", "pds", "pension", "certificate", "grievance",
        "scheme", "governance", "public service", "tribal rights"
    ]
}

CRITICAL_RISK_KEYWORDS = [
    "fluoride", "arsenic", "outbreak", "epidemic", "toxic", "poison", "death",
    "casualty", "emergency", "severe", "collapse", "contamination", "starvation"
]


# ── 1. Classification Engine ──────────────────────────────────────────────────
def classify_challenge(title: str, description: str, category_hint: str) -> Tuple[str, str, List[str]]:
    text_lower = f"{title} {description}".lower()
    scores: Dict[str, float] = {}

    for sector, keywords in SECTOR_KEYWORDS.items():
        match_count = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
        score = float(match_count)
        # Give a small boost if category hint matches sector name
        if category_hint and category_hint.lower() in sector.lower():
            score += 1.5
        scores[sector] = score

    # Select primary sector with highest score
    sorted_sectors = sorted(scores.items(), key=lambda x: x[1], reverse=0 > 1) # descending
    sorted_sectors = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary_sector = sorted_sectors[0][0] if sorted_sectors[0][1] > 0 else (category_hint or "Water & Sanitation")

    # Extract keywords present in text
    extracted_keywords = []
    for kw in SECTOR_KEYWORDS.get(primary_sector, []) + CRITICAL_RISK_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower) and kw not in extracted_keywords:
            extracted_keywords.append(kw)

    subcategory = f"{primary_sector} Local Issue"
    if "fluoride" in text_lower or "arsenic" in text_lower:
        subcategory = "Groundwater Contamination & Remediation"
    elif "drought" in text_lower or "irrigation" in text_lower:
        subcategory = "Agricultural Water Resource Management"
    elif "mining" in text_lower or "pollution" in text_lower:
        subcategory = "Industrial Pollution & Environmental Health"

    return (primary_sector, subcategory, extracted_keywords)


# ── 2. Priority Score Engine ─────────────────────────────────────────────────
def calculate_priority_score(
    citizen_severity: int,
    affected_pop: int,
    extracted_keywords: List[str],
    primary_sector: str
) -> Tuple[float, PriorityLabel, str]:
    """
    Calculates deterministic Priority Score (0-100) strictly from submission data.
    """
    # Component 1: Citizen reported severity (1-5) -> max 60 points
    sev_component = citizen_severity * 12.0

    # Component 2: Affected population bracket -> max 15 points
    pop = max(1, affected_pop or 50)
    pop_component = min(15.0, math.log10(pop) * 5.0)

    # Component 3: Critical risk keywords -> 6 points per keyword (max 18 points)
    critical_matches = [kw for kw in extracted_keywords if kw in CRITICAL_RISK_KEYWORDS]
    kw_component = min(18.0, len(critical_matches) * 6.0)

    # Component 4: Category risk factor -> Water / Healthcare / Environment get +5
    cat_component = 5.0 if primary_sector in ["Water & Sanitation", "Healthcare", "Environment"] else 2.0

    total_score = min(98.0, round(sev_component + pop_component + kw_component + cat_component, 1))

    if total_score >= 85.0:
        label = PriorityLabel.CRITICAL
    elif total_score >= 65.0:
        label = PriorityLabel.HIGH
    elif total_score >= 40.0:
        label = PriorityLabel.MEDIUM
    else:
        label = PriorityLabel.LOW

    explanation = (
        f"Priority Score of {total_score}/100 ({label.value}) calculated strictly from submission evidence: "
        f"Reported severity rating ({citizen_severity}/5), estimated affected population ({pop}), "
        f"and presence of risk indicators ({', '.join(critical_matches) if critical_matches else 'standard risk'})."
    )

    return (total_score, label, explanation)


# ── 3. Geographic Relevance Engine ───────────────────────────────────────────
def calculate_geographic_score(challenge_district: District, target_district: District) -> float:
    if challenge_district.id == target_district.id:
        return 100.0  # Same district
    if challenge_district.division == target_district.division:
        return 60.0   # Same administrative division
    return 20.0       # Different division in Jharkhand


# ── 4. University Recommendation Engine ──────────────────────────────────────
def recommend_universities(
    db: Session,
    primary_sector: str,
    challenge_district_id: str
) -> List[Dict[str, Any]]:
    ch_district = db.query(District).filter(District.id == challenge_district_id).first()
    all_universities = db.query(University).filter(University.is_active == True).all()

    recommendations = []

    for univ in all_universities:
        univ_district = db.query(District).filter(District.id == univ.district_id).first()
        geo_score = calculate_geographic_score(ch_district, univ_district) if (ch_district and univ_district) else 20.0

        # Domain Match Score (40% weight)
        domain_exp = db.query(UniversityExpertise).filter(
            UniversityExpertise.university_id == univ.id,
            UniversityExpertise.domain.ilike(f"%{primary_sector}%")
        ).first()

        if domain_exp:
            domain_score = min(100.0, domain_exp.score * 10.0)
            exp_source_type = domain_exp.source_type
            exp_notes = domain_exp.derivation_notes or f"Matching department in {domain_exp.domain}"
        else:
            domain_score = 60.0
            exp_source_type = "PROTOTYPE_METADATA"
            exp_notes = "General Higher Education Capacity"

        # Capacity Match Score (25% weight) — Tagged PROTOTYPE METADATA
        cap_ratio = max(0.2, (univ.active_capacity - univ.current_load) / max(1, univ.active_capacity))
        capacity_score = min(100.0, round(cap_ratio * 100.0, 1))

        # Experience Match Score (15% weight) — Tagged PROTOTYPE METADATA
        experience_score = 75.0

        # Weighted Match Score Formula
        total_match = round(
            (domain_score * 0.40) +
            (geo_score * 0.20) +
            (capacity_score * 0.25) +
            (experience_score * 0.15),
            1
        )

        rationale = (
            f"Match Score: {total_match}%. "
            f"Domain Alignment ({domain_score:.0f}%): {exp_notes} [{exp_source_type}]. "
            f"Geographic Proximity ({geo_score:.0f}%): {univ.city}, {univ_district.division if univ_district else 'Jharkhand'}. "
            f"Available Lab Capacity ({capacity_score:.0f}%): [PROTOTYPE METADATA]."
        )

        recommendations.append({
            "university_id": str(univ.id),
            "university_name": univ.name,
            "short_name": univ.short_name,
            "type": univ.type,
            "city": univ.city,
            "match_score": total_match,
            "domain_score": domain_score,
            "geography_score": geo_score,
            "capacity_score": capacity_score,
            "experience_score": experience_score,
            "explanation": rationale,
            "domain_source_type": exp_source_type,
            "capacity_source_type": "PROTOTYPE_METADATA"
        })

    # Sort descending by match score and pick top 3
    sorted_recs = sorted(recommendations, key=lambda x: x["match_score"], reverse=True)
    return sorted_recs[:3]


# ── 5. Duplicate Detection Engine ─────────────────────────────────────────────
def detect_duplicates(
    db: Session,
    title: str,
    description: str,
    district_id: str,
    exclude_challenge_id: Any = None,
    exclude_short_id: Any = None
) -> Tuple[bool, float, List[str], str]:
    """
    Compares the challenge against previous challenges in the same district.
    ALWAYS excludes the current challenge itself (by ID or short_id).

    Returns:
        (is_duplicate_flag, highest_similarity_score, similar_challenge_ids, similarity_classification)
    """
    query = db.query(Challenge).filter(Challenge.district_id == district_id)
    if exclude_challenge_id:
        query = query.filter(Challenge.id != exclude_challenge_id)
    if exclude_short_id:
        query = query.filter(Challenge.short_id != exclude_short_id)

    existing = query.all()
    if not existing:
        return (False, 0.0, [], "LOW_SIMILARITY")

    new_text = f"{title} {description}".lower()
    new_tokens = set(re.findall(r'\w+', new_text))
    if not new_tokens:
        return (False, 0.0, [], "LOW_SIMILARITY")

    highest_sim = 0.0
    similar_ids = []

    for ch in existing:
        # Exclude self if ID matches string representation
        if exclude_challenge_id and str(ch.id) == str(exclude_challenge_id):
            continue
        if exclude_short_id and str(ch.short_id) == str(exclude_short_id):
            continue

        ch_text = f"{ch.title} {ch.description}".lower()
        ch_tokens = set(re.findall(r'\w+', ch_text))
        if not ch_tokens:
            continue

        intersection = new_tokens.intersection(ch_tokens)
        union = new_tokens.union(ch_tokens)
        jaccard_sim = len(intersection) / len(union) if union else 0.0
        sim_score = round(jaccard_sim * 100.0, 1)

        if sim_score > highest_sim:
            highest_sim = sim_score
        if sim_score >= 50.0:
            similar_ids.append(ch.short_id)

    is_duplicate = highest_sim >= 65.0

    if highest_sim >= 85.0:
        sim_class = "EXACT_OR_NEAR_EXACT_DUPLICATE"
    elif highest_sim >= 50.0:
        sim_class = "POTENTIALLY_SIMILAR_CHALLENGE"
    else:
        sim_class = "LOW_SIMILARITY"

    return (is_duplicate, highest_sim, similar_ids, sim_class)
