"""Shared career and skill catalogue used by the API and synthetic-data generator."""

SKILLS = [
    "python",
    "sql",
    "excel",
    "statistics",
    "data_visualization",
    "machine_learning",
    "deep_learning",
    "web_development",
    "testing",
    "cloud",
    "business_analysis",
    "communication",
    "problem_solving",
    "teamwork",
    "critical_thinking",
]

CAREERS = {
    "Data Analyst": {
        "domain": "Data & Analytics",
        "description": "Turn data into clear insights that support better business decisions.",
        "required_skills": ["sql", "excel", "statistics", "data_visualization", "communication", "critical_thinking"],
        "responsibilities": ["Query and clean datasets", "Build reports and dashboards", "Explain findings to stakeholders"],
        "resources": ["SQLBolt — interactive SQL lessons", "Kaggle Learn — Data Visualization", "Microsoft Learn — Power BI"],
    },
    "Business Analyst": {
        "domain": "Business & Product",
        "description": "Connect business needs with practical process and technology improvements.",
        "required_skills": ["excel", "business_analysis", "communication", "problem_solving", "teamwork", "critical_thinking"],
        "responsibilities": ["Gather stakeholder requirements", "Map business processes", "Define and validate solution requirements"],
        "resources": ["IIBA — Business Analysis resources", "Atlassian — user story guide", "Coursera — Business Analysis foundations"],
    },
    "Machine Learning Engineer": {
        "domain": "AI & Machine Learning",
        "description": "Build, evaluate, and maintain software systems powered by machine learning.",
        "required_skills": ["python", "statistics", "machine_learning", "cloud", "sql", "problem_solving", "teamwork"],
        "responsibilities": ["Prepare data and train models", "Deploy inference services", "Monitor model quality and reliability"],
        "resources": ["scikit-learn User Guide", "Google — Machine Learning Crash Course", "FastAPI — first steps"],
    },
    "Data Scientist": {
        "domain": "AI & Machine Learning",
        "description": "Use statistics, programming, and domain knowledge to answer complex questions with data.",
        "required_skills": ["python", "sql", "statistics", "data_visualization", "machine_learning", "critical_thinking"],
        "responsibilities": ["Explore and model data", "Communicate evidence and uncertainty", "Prototype predictive solutions"],
        "resources": ["Kaggle Learn — Pandas", "StatQuest — statistics and ML", "scikit-learn tutorials"],
    },
    "Software Developer": {
        "domain": "Software & Cloud",
        "description": "Design, implement, test, and maintain reliable software applications.",
        "required_skills": ["python", "web_development", "testing", "cloud", "problem_solving", "teamwork", "communication"],
        "responsibilities": ["Implement application features", "Review and test code", "Collaborate on design and delivery"],
        "resources": ["The Odin Project — foundations", "MDN Web Docs", "GitHub Skills — Introduction to GitHub"],
    },
    "QA Analyst": {
        "domain": "Software & Cloud",
        "description": "Improve product quality by designing and executing thoughtful software tests.",
        "required_skills": ["testing", "sql", "web_development", "communication", "problem_solving", "teamwork"],
        "responsibilities": ["Create test plans and cases", "Report and verify defects", "Support release quality checks"],
        "resources": ["Ministry of Testing — learning resources", "Playwright documentation", "ISTQB — Foundation Level syllabus"],
    },
}

QUALIFICATIONS = ["High school", "Diploma", "Bachelor's", "Master's", "Other"]
EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"]
DOMAINS = ["Data & Analytics", "Business & Product", "AI & Machine Learning", "Software & Cloud", "Explore all"]
INTERESTS = ["Working with data", "Building products", "Solving business problems", "Artificial intelligence", "Quality and testing"]

ROLE_SKILL_PROFILES = {
    "Data Analyst": {"sql", "excel", "statistics", "data_visualization", "communication", "critical_thinking"},
    "Business Analyst": {"excel", "business_analysis", "communication", "problem_solving", "teamwork", "critical_thinking"},
    "Machine Learning Engineer": {"python", "statistics", "machine_learning", "cloud", "sql", "problem_solving", "teamwork"},
    "Data Scientist": {"python", "sql", "statistics", "data_visualization", "machine_learning", "critical_thinking"},
    "Software Developer": {"python", "web_development", "testing", "cloud", "problem_solving", "teamwork", "communication"},
    "QA Analyst": {"testing", "sql", "web_development", "communication", "problem_solving", "teamwork"},
}
