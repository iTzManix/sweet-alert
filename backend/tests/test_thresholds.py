import datetime

from app.thresholds import (
    age_to_brfss_bucket,
    age_years,
    level_from_probability,
    lifestyle_category,
    nutrition_score_and_category,
)


def test_level_from_probability_boundaries():
    assert level_from_probability(0.0) == "bajo"
    assert level_from_probability(0.29) == "bajo"
    assert level_from_probability(0.30) == "moderado"
    assert level_from_probability(0.59) == "moderado"
    assert level_from_probability(0.60) == "alto"
    assert level_from_probability(1.0) == "alto"


def test_age_to_brfss_bucket_edges():
    assert age_to_brfss_bucket(10) == 1
    assert age_to_brfss_bucket(18) == 1
    assert age_to_brfss_bucket(24) == 1
    assert age_to_brfss_bucket(25) == 2
    assert age_to_brfss_bucket(79) == 12
    assert age_to_brfss_bucket(80) == 13
    assert age_to_brfss_bucket(120) == 13


def test_age_years_accepts_str_and_date():
    today = datetime.date.today()
    born = today.replace(year=today.year - 30)
    assert age_years(born.isoformat()) == 30
    assert age_years(born) == 30


def test_lifestyle_category_extremes():
    assert lifestyle_category(sleep_duration_hours=9, sleep_quality=10, physical_activity_level=100, stress_level=0) == "excelente"
    assert lifestyle_category(sleep_duration_hours=0, sleep_quality=1, physical_activity_level=0, stress_level=10) == "malo"


def test_nutrition_score_and_category_extremes():
    score, category = nutrition_score_and_category(
        fruit_servings=3, veggie_servings=4, fiber_g=30, sugar_g=20, water_l=2.5
    )
    assert score == 5
    assert category == "excelente"

    score, category = nutrition_score_and_category(
        fruit_servings=0, veggie_servings=0, fiber_g=5, sugar_g=100, water_l=0.5
    )
    assert score == 0
    assert category == "deficiente"
