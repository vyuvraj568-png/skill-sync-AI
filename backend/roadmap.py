"""Create a four-week plan from a role's actual skill gaps."""

from career_data import CAREERS
from skill_gap import analyze_skill_gap


def generate_roadmap(role, skills):
    gap = analyze_skill_gap(role, skills)
    resources = CAREERS[role]["resources"]
    missing = [item["skill"] for item in gap["missing_skills"]]
    if not missing:
        missing = gap["required_skills"][:1]
    weeks = []
    for week_index in range(4):
        skill = missing[min(week_index, len(missing) - 1)]
        label = skill.replace("_", " ").title()
        weeks.append(
            {
                "week": week_index + 1,
                "goal": f"Build practical confidence in {label}",
                "topics": [f"{label} fundamentals", f"{label} applied to {role}"],
                "practice_task": f"Complete one focused {label} exercise and write down what you learned.",
                "mini_project": f"Create a small {role} portfolio artifact that demonstrates {label}.",
                "resource": resources[week_index % len(resources)],
                "skill": skill,
            }
        )
    return {"role": role, "weeks": weeks, "based_on_missing_skills": gap["missing_skills"]}
