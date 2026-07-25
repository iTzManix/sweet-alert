import pandas as pd

from ..schemas.assessment import AssessmentIn
from ..thresholds import age_years
from ..thresholds import lifestyle_category as compute_lifestyle_category


def _build_input(profile: dict, body: AssessmentIn) -> pd.DataFrame:
    row = {
        "Gender": "Male" if profile["sex"] == "M" else "Female",
        "Age": age_years(profile["birth_date"]),
        "Occupation": profile.get("occupation") or "Other",
        "Sleep Duration": body.sleep_duration_hours,
        "Quality of Sleep": body.sleep_quality,
        "Physical Activity Level": body.physical_activity_level,
        "Stress Level": body.stress_level,
        "Heart Rate": body.heart_rate,
        "Daily Steps": body.daily_steps,
    }
    return pd.DataFrame([row])


def predict(pipeline, profile: dict, body: AssessmentIn) -> tuple[float, str]:
    """Devuelve (probabilidad de trastorno de sueño, categoría de estilo de vida).

    La categoría Excelente/Bueno/Regular/Malo se calcula por fórmula (no ML,
    ver thresholds.lifestyle_category). El modelo entrenado predice la
    probabilidad de un trastorno de sueño real (None/Insomnia/Sleep Apnea),
    que se guarda como señal secundaria.
    """
    X = _build_input(profile, body)
    proba = pipeline.predict_proba(X)[0]
    classes = list(pipeline.classes_)
    none_idx = classes.index("None")
    disorder_probability = float(1 - proba[none_idx])

    category = compute_lifestyle_category(
        body.sleep_duration_hours, body.sleep_quality, body.physical_activity_level, body.stress_level
    )
    return disorder_probability, category
