import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app as skillsync_app
from generate_dataset import generate_rows
from train_model import train_models


@pytest.fixture(scope="session", autouse=True)
def trained_models(tmp_path_factory):
    directory = tmp_path_factory.mktemp("trained-model")
    dataset = directory / "profiles.csv"
    import pandas as pd

    pd.DataFrame(generate_rows(per_role=30)).to_csv(dataset, index=False)
    model_path = directory / "models.joblib"
    metrics_path = directory / "metrics.json"
    train_models(dataset, model_path, metrics_path)
    import json

    skillsync_app._bundle = __import__("joblib").load(model_path)
    skillsync_app._metrics = json.loads(metrics_path.read_text(encoding="utf-8"))


@pytest.fixture()
def client():
    return skillsync_app.app.test_client()


def valid_profile():
    return {
        "highest_qualification": "Bachelor's",
        "experience_level": "Intermediate",
        "preferred_domain": "Data & Analytics",
        "interest": "Working with data",
        "skills": ["sql", "excel", "statistics"],
    }


def test_health_and_careers(client):
    assert client.get("/api/health").status_code == 200
    response = client.get("/api/careers")
    assert response.status_code == 200
    assert len(response.get_json()["careers"]) == 6


def test_predict_returns_model_outputs(client):
    response = client.post("/api/predict", json=valid_profile())
    assert response.status_code == 200
    body = response.get_json()
    assert body["predicted_role"] in skillsync_app.CAREERS
    assert len(body["probabilities"]) == 6
    assert body["model"] == skillsync_app._bundle["selected_model"]


def test_predict_validates_profile(client):
    response = client.post("/api/predict", json={"skills": ["not-a-skill"]})
    assert response.status_code == 400
    assert "error" in response.get_json()
    nested_skills = valid_profile()
    nested_skills["skills"] = [{}]
    assert client.post("/api/predict", json=nested_skills).status_code == 400


def test_skill_gap_and_roadmap(client):
    gap = client.post("/api/skill-gap", json={"role": "Data Analyst", "skills": ["sql"]})
    assert gap.status_code == 200
    assert gap.get_json()["coverage_percentage"] == 17
    roadmap = client.get("/api/roadmap?role=Data%20Analyst&skills=sql")
    assert roadmap.status_code == 200
    assert len(roadmap.get_json()["weeks"]) == 4


def test_metrics_are_evaluated_and_complete(client):
    response = client.get("/api/model-metrics")
    assert response.status_code == 200
    body = response.get_json()
    assert len(body["models"]) == 3
    assert all("confusion_matrix" in result for result in body["models"].values())
    assert body["dataset"]["synthetic"] is True
