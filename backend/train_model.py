"""Train, compare, evaluate, and persist the career classifiers."""

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from career_data import SKILLS

BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "dataset" / "career_profiles.csv"
MODEL_PATH = BASE_DIR / "models" / "career_models.joblib"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"
CATEGORICAL_FEATURES = ["highest_qualification", "experience_level", "preferred_domain", "interest"]
FEATURES = CATEGORICAL_FEATURES + SKILLS
TARGET = "career_role"


def create_preprocessor():
    return ColumnTransformer(
        [
            ("categories", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("skills", StandardScaler(), SKILLS),
        ]
    )


def train_models(dataset_path=DATASET_PATH, model_path=MODEL_PATH, metrics_path=METRICS_PATH):
    data = pd.read_csv(dataset_path)
    expected_columns = set(FEATURES + [TARGET])
    missing_columns = expected_columns.difference(data.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {', '.join(sorted(missing_columns))}")
    data = data.dropna(subset=FEATURES + [TARGET]).drop_duplicates()
    if data[TARGET].nunique() < 2:
        raise ValueError("Training data must contain at least two career-role labels.")

    x_train, x_test, y_train, y_test = train_test_split(
        data[FEATURES],
        data[TARGET],
        test_size=0.25,
        random_state=42,
        stratify=data[TARGET],
    )
    estimators = {
        "Decision Tree": DecisionTreeClassifier(max_depth=8, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=250, class_weight="balanced", random_state=42, n_jobs=-1
        ),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=7, weights="distance"),
    }
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    models = {}
    for name, estimator in estimators.items():
        pipeline = Pipeline([("preprocessor", create_preprocessor()), ("classifier", estimator)])
        validation_scores = cross_val_score(pipeline, x_train, y_train, cv=folds, scoring="accuracy")
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, predictions, average="macro", zero_division=0
        )
        labels = sorted(data[TARGET].unique())
        results[name] = {
            "accuracy": float(accuracy_score(y_test, predictions)),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "cross_validation_accuracy": [float(score) for score in validation_scores],
            "mean_cross_validation_accuracy": float(validation_scores.mean()),
            "confusion_matrix": confusion_matrix(y_test, predictions, labels=labels).tolist(),
            "labels": labels,
        }
        models[name] = pipeline

    selected_model = max(results, key=lambda name: results[name]["mean_cross_validation_accuracy"])
    model_path.parent.mkdir(parents=True, exist_ok=True)
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"models": models, "selected_model": selected_model}, model_path)
    summary = {
        "models": results,
        "selected_model": selected_model,
        "dataset": {
            "records": int(len(data)),
            "train_records": int(len(x_train)),
            "test_records": int(len(x_test)),
            "roles": labels,
            "synthetic": True,
            "description": "Deterministic synthetic educational profiles; not representative of labour-market outcomes.",
        },
        "selection_metric": "Mean 5-fold cross-validation accuracy on the training split; ties follow the declared estimator order.",
    }
    metrics_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


if __name__ == "__main__":
    report = train_models()
    print(f"Selected model: {report['selected_model']}")
    print(json.dumps(report["models"], indent=2))
