"""Corren los servicios contra los pipelines .joblib reales (no mocks):
si alguien cambia una columna en un notebook y reexporta el modelo sin
avisar, esto revienta acá en vez de en producción.
"""

from app.models import registry
from app.schemas.assessment import AssessmentIn
from app.services import lifestyle, nutrition, risk, symptoms

registry.load_models()

BASE_PROFILE = {
    "sex": "F",
    "birth_date": "1990-05-20",
    "height_cm": 165,
    "education_level": 4,
    "income_level": 5,
    "occupation": "Nurse",
}


def make_body(**overrides) -> AssessmentIn:
    defaults = dict(
        weight_kg=70,
        high_bp=False,
        high_chol=False,
        chol_check=True,
        smoker=False,
        stroke=False,
        heart_disease=False,
        phys_activity=True,
        fruits=True,
        veggies=True,
        hvy_alcohol=False,
        any_healthcare=True,
        no_doc_cost=False,
        gen_health=2,
        ment_health_days=0,
        phys_health_days=0,
        diff_walk=False,
        polyuria=False,
        polydipsia=False,
        sudden_weight_loss=False,
        weakness=False,
        polyphagia=False,
        genital_thrush=False,
        visual_blurring=False,
        itching=False,
        irritability=False,
        delayed_healing=False,
        partial_paresis=False,
        muscle_stiffness=False,
        alopecia=False,
        obesity=False,
        sleep_duration_hours=7.5,
        sleep_quality=8,
        physical_activity_level=60,
        stress_level=3,
        daily_steps=9000,
        heart_rate=70,
        daily_calories=2000,
        sugar_g=30,
        carbs_g=200,
        protein_g=80,
        fat_g=50,
        fiber_g=28,
        water_l=2.2,
        fruit_servings=3,
        veggie_servings=4,
    )
    defaults.update(overrides)
    return AssessmentIn(**defaults)


def test_risk_predict_returns_valid_bucket():
    proba, level = risk.predict(registry.risk_pipeline(), BASE_PROFILE, make_body())
    assert 0 <= proba <= 1
    assert level in {"bajo", "moderado", "alto"}


def test_risk_higher_with_worse_habits():
    healthy_proba, _ = risk.predict(registry.risk_pipeline(), BASE_PROFILE, make_body())
    unhealthy_body = make_body(
        high_bp=True,
        high_chol=True,
        smoker=True,
        heart_disease=True,
        phys_activity=False,
        fruits=False,
        veggies=False,
        gen_health=5,
        diff_walk=True,
        weight_kg=110,
    )
    unhealthy_proba, _ = risk.predict(registry.risk_pipeline(), BASE_PROFILE, unhealthy_body)
    assert unhealthy_proba > healthy_proba


def test_symptoms_predict_returns_valid_bucket():
    proba, level = symptoms.predict(registry.symptoms_pipeline(), BASE_PROFILE, make_body())
    assert 0 <= proba <= 1
    assert level in {"bajo", "moderado", "alto"}


def test_symptoms_higher_with_classic_symptoms():
    plain_proba, _ = symptoms.predict(registry.symptoms_pipeline(), BASE_PROFILE, make_body())
    symptomatic_body = make_body(
        polyuria=True,
        polydipsia=True,
        sudden_weight_loss=True,
        weakness=True,
        polyphagia=True,
        visual_blurring=True,
    )
    symptomatic_proba, _ = symptoms.predict(registry.symptoms_pipeline(), BASE_PROFILE, symptomatic_body)
    assert symptomatic_proba > plain_proba


def test_lifestyle_predict_returns_valid_category():
    proba, category = lifestyle.predict(registry.lifestyle_pipeline(), BASE_PROFILE, make_body())
    assert 0 <= proba <= 1
    assert category in {"excelente", "bueno", "regular", "malo"}


def test_nutrition_compute_matches_formula():
    score, category = nutrition.compute(make_body())
    assert 0 <= score <= 5
    assert category in {"excelente", "buena", "regular", "deficiente"}
