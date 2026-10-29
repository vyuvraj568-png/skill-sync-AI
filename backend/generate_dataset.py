"""Generate a replaceable, deterministic synthetic career-profile dataset."""

import csv
import random
from pathlib import Path

from career_data import CAREERS, DOMAINS, INTERESTS, QUALIFICATIONS, ROLE_SKILL_PROFILES, SKILLS

OUTPUT = Path(__file__).parent / "dataset" / "career_profiles.csv"
ROLE_DOMAINS = {role: info["domain"] for role, info in CAREERS.items()}
ROLE_INTERESTS = {
    "Data Analyst": "Working with data",
    "Business Analyst": "Solving business problems",
    "Machine Learning Engineer": "Artificial intelligence",
    "Data Scientist": "Artificial intelligence",
    "Software Developer": "Building products",
    "QA Analyst": "Quality and testing",
}


def generate_rows(seed=42, per_role=100):
    rng = random.Random(seed)
    qualifications = {
        "Data Analyst": ["Bachelor's", "Master's", "Diploma"],
        "Business Analyst": ["Bachelor's", "Master's", "Diploma"],
        "Machine Learning Engineer": ["Bachelor's", "Master's"],
        "Data Scientist": ["Bachelor's", "Master's"],
        "Software Developer": ["Bachelor's", "Diploma", "Other"],
        "QA Analyst": ["Bachelor's", "Diploma", "Other"],
    }
    rows = []
    for role, core_skills in ROLE_SKILL_PROFILES.items():
        for _ in range(per_role):
            skills = {skill: int(skill in core_skills) for skill in SKILLS}
            for skill in SKILLS:
                if skill not in core_skills and rng.random() < 0.12:
                    skills[skill] = 1
                elif skill in core_skills and rng.random() < 0.08:
                    skills[skill] = 0
            experience = rng.choices(
                ["Beginner", "Intermediate", "Advanced"],
                weights=[0.48, 0.37, 0.15],
            )[0]
            row = {
                "highest_qualification": rng.choice(qualifications[role]),
                "experience_level": experience,
                "preferred_domain": ROLE_DOMAINS[role] if rng.random() < 0.78 else rng.choice(DOMAINS),
                "interest": ROLE_INTERESTS[role] if rng.random() < 0.78 else rng.choice(INTERESTS),
                **skills,
                "career_role": role,
            }
            rows.append(row)
    rng.shuffle(rows)
    return rows


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rows = generate_rows()
    with OUTPUT.open("w", newline="", encoding="utf-8") as dataset_file:
        writer = csv.DictWriter(dataset_file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} synthetic records to {OUTPUT}")


if __name__ == "__main__":
    main()
