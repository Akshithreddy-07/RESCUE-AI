from pydantic import BaseModel
from typing import List

class VictimInput(BaseModel):
    victim_id: str
    age_group: str          # "child", "adult", "elderly"
    injury_severity: str    # "minor", "moderate", "critical"
    submerged: bool
    trapped: bool

def calculate_priority_score(victim: VictimInput) -> dict:
    """Calculates Explainable AI (XAI) urgency priority score (0-100)."""
    score = 0
    factors = []

    # Injury weights
    if victim.injury_severity == "critical":
        score += 45
        factors.append("Critical Injury (+45)")
    elif victim.injury_severity == "moderate":
        score += 25
        factors.append("Moderate Injury (+25)")
    else:
        score += 10
        factors.append("Minor Injury (+10)")

    # Vulnerability weights
    if victim.age_group == "child":
        score += 25
        factors.append("Child Vulnerability (+25)")
    elif victim.age_group == "elderly":
        score += 20
        factors.append("Elderly Vulnerability (+20)")

    # Environment weights
    if victim.submerged:
        score += 20
        factors.append("Submerged Threat (+20)")
    if victim.trapped:
        score += 10
        factors.append("Trapped Hazard (+10)")

    final_score = min(score, 100)
    
    return {
        "victim_id": victim.victim_id,
        "priority_score": final_score,
        "urgency_level": "CRITICAL" if final_score >= 70 else "HIGH" if final_score >= 40 else "MODERATE",
        "reasoning": factors
    }