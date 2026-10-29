# SkillSync AI — Smart Career & Skill Gap Predictor

SkillSync AI is a locally runnable React + Flask academic project demonstrating supervised learning for career-role exploration. A profile is passed to one of three trained scikit-learn classifiers; the API returns class probabilities, a skill-gap analysis, and a four-week learning plan.

> **Dataset limitation:** The included 600-row CSV is deterministic synthetic educational data created for this project. It is not representative of labour-market outcomes, does not measure employability, and cannot support real-world accuracy claims. Evaluation scores describe only a held-out portion of this generated dataset. Replace it with appropriately licensed, representative, consented labelled data before making real-world conclusions.

## What is included

- Three end-to-end sklearn pipelines: Decision Tree, Random Forest, and K-Nearest Neighbors. One-hot encoding and skill scaling are fitted only inside each training fold.
- Stratified train/test split, five-fold cross-validation on the training split, macro precision/recall/F1, accuracy, and confusion matrices. Model selection uses mean cross-validation accuracy only; ties follow the declared estimator order.
- Flask JSON API with validation, CORS limited to the local Vite development origins, and explicit errors when model files are not trained.
- React/Vite responsive dashboard styled with Tailwind CSS and custom CSS animations, with Chart.js visualizations, model-driven role probabilities, skill coverage (shown separately from confidence), profile summary, alternatives, career explorer, model evaluation, and interactive roadmap checkboxes.
- Browser print/export report, light/dark toggle, loading and error states, and a small local analysis history.

## Windows setup (VS Code)

Prerequisites: Python 3.10+ and Node.js 18+ installed and available in the VS Code terminal.

1. Open this project folder in VS Code. In a PowerShell terminal:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   python generate_dataset.py
   python train_model.py
   python -m pytest
   ```

   If PowerShell blocks activation, use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again. Alternatively run `.venv\Scripts\python.exe` directly for each Python command.

2. Open a second VS Code terminal at the project root:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Keep the frontend terminal open, then in another terminal start the API:

   ```powershell
   cd backend
   .\.venv\Scripts\Activate.ps1
   python app.py
   ```

4. Open the Vite URL printed in the terminal (normally `http://127.0.0.1:5173`). The API is at `http://127.0.0.1:5000/api/health`.

The trained artifacts are stored under `backend/models/` and are generated locally by `train_model.py`. Retrain after replacing the CSV.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API status |
| GET | `/api/careers` | Role catalogue and accepted profile values |
| POST | `/api/predict` | ML prediction, class probabilities, and matched skills |
| POST | `/api/skill-gap` | Role requirements, coverage, and prioritized gaps |
| GET | `/api/model-metrics` | Actual test/CV metrics and confusion matrices |
| GET | `/api/roadmap?role=Data%20Analyst&skills=sql,excel` | Four-week plan for a role and existing skills |

`POST /api/predict` body example:

```json
{
  "highest_qualification": "Bachelor's",
  "experience_level": "Intermediate",
  "preferred_domain": "Data & Analytics",
  "interest": "Working with data",
  "skills": ["sql", "excel", "statistics"],
  "learning_goals": "Build a portfolio project"
}
```

`learning_goals` is collected for context but intentionally excluded from the fixed-feature training model.

## ML overview for the project demonstration

- **Decision Tree:** learns a hierarchy of feature decisions; interpretable but potentially prone to overfitting.
- **Random Forest:** averages many randomized trees to reduce variance.
- **K-Nearest Neighbors:** assigns a role from nearby preprocessed profiles; feature scaling matters for distance.
- **Accuracy** is the fraction of correct predictions. **Macro precision** and **macro recall** average per-class values equally; **macro F1** is their harmonic-mean summary. A **confusion matrix** exposes which labels are mixed up.
- Cross-validation is run on training data only. Held-out test metrics are calculated after fitting on the training split. Dataset preprocessing is encapsulated in each pipeline, preventing test-fold fitting leakage.

## Demonstration suggestions

1. Start on Overview and show the workflow.
2. Create profiles with different domains and skill combinations; show top match and alternatives.
3. Explain that model confidence is not skill coverage or employment likelihood.
4. Open Career Explorer and expand roles to discuss responsibilities/resources.
5. Open Model Evaluation and compare actual run metrics, confusion matrices, and the synthetic-data caveat.
6. Tick roadmap weeks, toggle theme, resize to mobile, and use **Export report** (browser print dialog → save as PDF).

## Troubleshooting

- **Model files missing:** From `backend`, run `python generate_dataset.py` and `python train_model.py`.
- **API offline in the UI:** Ensure `python app.py` is running on port 5000. Check `http://127.0.0.1:5000/api/health`.
- **CORS/network error:** Use the Vite development server on `http://127.0.0.1:5173` or `http://localhost:5173`; those local origins are allowed.
- **Port already in use:** Stop the other local service or change the Flask/Vite port and update the API URL/CORS configuration together.
- **PowerShell activation denied:** Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for the current terminal only, or invoke the virtual-environment Python executable directly.
- **Charts/React dependency errors:** From `frontend`, run `npm install` after confirming Node/npm are installed.
