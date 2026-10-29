"""Flask REST API for the SkillSync AI career guidance application."""

from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from career_data import CAREERS, DOMAINS, EXPERIENCE_LEVELS, INTERESTS, QUALIFICATIONS, SKILLS
from roadmap import generate_roadmap
from skill_gap import analyze_skill_gap
from train_model import CATEGORICAL_FEATURES, MODEL_PATH

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
_bundle = None
_metrics = None


def load_artifacts():
    global _bundle, _metrics
    metrics_path = Path(__file__).parent / "models" / "model_metrics.json"
    if not MODEL_PATH.exists() or not metrics_path.exists():
        raise RuntimeError("Trained model files are missing. Run `python train_model.py` from the backend folder.")
    _bundle = joblib.load(MODEL_PATH)
    import json

    _metrics = json.loads(metrics_path.read_text(encoding="utf-8"))


def ensure_artifacts():
    if _bundle is None or _metrics is None:
        load_artifacts()


def validate_profile(payload):
    if not isinstance(payload, dict):
        return None, "Request body must be a JSON object."
    qualification = payload.get("highest_qualification")
    experience = payload.get("experience_level")
    domain = payload.get("preferred_domain")
    interest = payload.get("interest")
    skills = payload.get("skills")
    invalid = []
    if qualification not in QUALIFICATIONS:
        invalid.append(f"highest_qualification must be one of: {', '.join(QUALIFICATIONS)}.")
    if experience not in EXPERIENCE_LEVELS:
        invalid.append(f"experience_level must be one of: {', '.join(EXPERIENCE_LEVELS)}.")
    if domain not in DOMAINS:
        invalid.append(f"preferred_domain must be one of: {', '.join(DOMAINS)}.")
    if interest not in INTERESTS:
        invalid.append(f"interest must be one of: {', '.join(INTERESTS)}.")
    if not isinstance(skills, list) or any(not isinstance(skill, str) or skill not in SKILLS for skill in skills):
        invalid.append("skills must be a list of supported skill identifiers.")
    if isinstance(skills, list) and all(isinstance(skill, str) for skill in skills) and len(set(skills)) != len(skills):
        invalid.append("skills must not contain duplicates.")
    if invalid:
        return None, " ".join(invalid)
    return {
        "highest_qualification": qualification,
        "experience_level": experience,
        "preferred_domain": domain,
        "interest": interest,
        "skills": skills,
    }, None


def feature_row(profile):
    row = {key: profile[key] for key in CATEGORICAL_FEATURES}
    row.update({skill: int(skill in profile["skills"]) for skill in SKILLS})
    return pd.DataFrame([row])


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "SkillSync AI API"})


@app.get("/api/careers")
def careers():
    return jsonify(
        {
            "careers": [
                {"role": role, **details}
                for role, details in CAREERS.items()
            ],
            "skills": SKILLS,
            "qualifications": QUALIFICATIONS,
            "experience_levels": EXPERIENCE_LEVELS,
            "domains": DOMAINS,
            "interests": INTERESTS,
        }
    )


@app.post("/api/predict")
def predict():
    profile, error = validate_profile(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400
    try:
        ensure_artifacts()
        model_name = _bundle["selected_model"]
        model = _bundle["models"][model_name]
        features = feature_row(profile)
        probabilities = model.predict_proba(features)[0]
        classes = model.named_steps["classifier"].classes_
        ranked = sorted(zip(classes, probabilities), key=lambda item: item[1], reverse=True)
        role = str(ranked[0][0])
        info = CAREERS[role]
        return jsonify(
            {
                "predicted_role": role,
                "model": model_name,
                "confidence": round(float(ranked[0][1]), 4),
                "probabilities": [{"role": str(label), "probability": round(float(score), 4)} for label, score in ranked],
                "description": info["description"],
                "required_skills": info["required_skills"],
                "matched_skills": [skill for skill in info["required_skills"] if skill in profile["skills"]],
                "alternatives": [{"role": str(label), "probability": round(float(score), 4)} for label, score in ranked[1:4]],
                "profile_summary": {
                    "qualification": profile["highest_qualification"],
                    "experience": profile["experience_level"],
                    "domain": profile["preferred_domain"],
                    "selected_skills": profile["skills"],
                },
            }
        )
    except (RuntimeError, OSError, KeyError, ValueError) as exc:
        app.logger.exception("Career prediction failed.")
        return jsonify({"error": str(exc)}), 503


@app.post("/api/skill-gap")
def skill_gap():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not isinstance(payload.get("role"), str) or not isinstance(payload.get("skills"), list):
        return jsonify({"error": "Provide a role and a list of skills."}), 400
    if payload["role"] not in CAREERS or any(skill not in SKILLS for skill in payload["skills"]):
        return jsonify({"error": "The role or one or more skills are not supported."}), 400
    return jsonify(analyze_skill_gap(payload["role"], payload["skills"]))


@app.get("/api/model-metrics")
def model_metrics():
    try:
        ensure_artifacts()
        return jsonify(_metrics)
    except (RuntimeError, OSError, ValueError) as exc:
        app.logger.exception("Model metrics could not be loaded.")
        return jsonify({"error": str(exc)}), 503


@app.get("/api/roadmap")
def roadmap():
    role = request.args.get("role")
    raw_skills = request.args.get("skills", "")
    skills = [item for item in raw_skills.split(",") if item]
    if role not in CAREERS or any(skill not in SKILLS for skill in skills):
        return jsonify({"error": "Provide a supported career role and comma-separated skill identifiers."}), 400
    return jsonify(generate_roadmap(role, skills))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
