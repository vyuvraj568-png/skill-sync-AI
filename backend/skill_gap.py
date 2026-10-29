"""Skill coverage and priority analysis."""

from career_data import CAREERS


def analyze_skill_gap(role, skills):
    if role not in CAREERS:
        raise ValueError("Unknown career role.")
    required = CAREERS[role]["required_skills"]
    available = sorted(set(skills).intersection(required))
    missing = [skill for skill in required if skill not in available]
    return {
        "role": role,
        "required_skills": required,
        "available_skills": available,
        "missing_skills": [
            {"skill": skill, "priority": "High" if index < 2 else "Medium"}
            for index, skill in enumerate(missing)
        ],
        "coverage_percentage": round(len(available) / len(required) * 100) if required else 100,
    }
