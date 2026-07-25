import pandas as pd

from ..schemas.assessment import AssessmentIn
from ..thresholds import age_to_brfss_bucket, age_years, level_from_probability


def _build_input(profile: dict, body: AssessmentIn) -> pd.DataFrame:
    height_m = profile["height_cm"] / 100
    bmi = body.weight_kg / (height_m**2)
    row = {
        "HighBP": int(body.high_bp),
        "HighChol": int(body.high_chol),
        "CholCheck": int(body.chol_check),
        "BMI": bmi,
        "Smoker": int(body.smoker),
        "Stroke": int(body.stroke),
        "HeartDiseaseorAttack": int(body.heart_disease),
        "PhysActivity": int(body.phys_activity),
        "Fruits": int(body.fruits),
        "Veggies": int(body.veggies),
        "HvyAlcoholConsump": int(body.hvy_alcohol),
        "AnyHealthcare": int(body.any_healthcare),
        "NoDocbcCost": int(body.no_doc_cost),
        "GenHlth": body.gen_health,
        "MentHlth": body.ment_health_days,
        "PhysHlth": body.phys_health_days,
        "DiffWalk": int(body.diff_walk),
        # Convención del dataset CDC/BRFSS: Sex 1 = hombre, 0 = mujer.
        "Sex": 1 if profile["sex"] == "M" else 0,
        "Age": age_to_brfss_bucket(age_years(profile["birth_date"])),
        "Education": profile["education_level"],
        "Income": profile["income_level"],
    }
    return pd.DataFrame([row])


def predict(pipeline, profile: dict, body: AssessmentIn) -> tuple[float, str]:
    X = _build_input(profile, body)
    proba = float(pipeline.predict_proba(X)[0, 1])
    return proba, level_from_probability(proba)
