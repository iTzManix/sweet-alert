import pandas as pd

from ..schemas.assessment import AssessmentIn
from ..thresholds import age_years, level_from_probability


def _yn(value: bool) -> str:
    return "Yes" if value else "No"


def _build_input(profile: dict, body: AssessmentIn) -> pd.DataFrame:
    row = {
        "Age": age_years(profile["birth_date"]),
        "Gender": "Male" if profile["sex"] == "M" else "Female",
        "Polyuria": _yn(body.polyuria),
        "Polydipsia": _yn(body.polydipsia),
        "sudden weight loss": _yn(body.sudden_weight_loss),
        "weakness": _yn(body.weakness),
        "Polyphagia": _yn(body.polyphagia),
        "Genital thrush": _yn(body.genital_thrush),
        "visual blurring": _yn(body.visual_blurring),
        "Itching": _yn(body.itching),
        "Irritability": _yn(body.irritability),
        "delayed healing": _yn(body.delayed_healing),
        "partial paresis": _yn(body.partial_paresis),
        "muscle stiffness": _yn(body.muscle_stiffness),
        "Alopecia": _yn(body.alopecia),
        "Obesity": _yn(body.obesity),
    }
    return pd.DataFrame([row])


def predict(pipeline, profile: dict, body: AssessmentIn) -> tuple[float, str]:
    X = _build_input(profile, body)
    proba = float(pipeline.predict_proba(X)[0, 1])
    return proba, level_from_probability(proba)
