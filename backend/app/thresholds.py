"""Umbrales de negocio, calibrados contra los modelos entrenados (ver models_artifacts).

Riesgo/síntomas: 0.30 y 0.60 se eligieron porque a esos cortes la tasa real
de diabetes/síntomas en el dataset de prueba salta de ~3% a ~14-36% a ~37-99%
(ver revisión de PrediccionRiesgo.ipynb / DeteccionSintomasTempranos.ipynb).
"""

from datetime import date

RISK_BAJO_MAX = 0.30
RISK_ALTO_MIN = 0.60


def level_from_probability(p: float) -> str:
    if p < RISK_BAJO_MAX:
        return "bajo"
    if p < RISK_ALTO_MIN:
        return "moderado"
    return "alto"


LIFESTYLE_EXCELENTE_MIN = 0.75
LIFESTYLE_BUENO_MIN = 0.55
LIFESTYLE_REGULAR_MIN = 0.35


def lifestyle_category(
    sleep_duration_hours: float, sleep_quality: int, physical_activity_level: int, stress_level: int
) -> str:
    score = (
        min(sleep_duration_hours / 9, 1) * 0.25
        + (sleep_quality / 10) * 0.25
        + (physical_activity_level / 100) * 0.25
        + ((10 - stress_level) / 10) * 0.25
    )
    if score >= LIFESTYLE_EXCELENTE_MIN:
        return "excelente"
    if score >= LIFESTYLE_BUENO_MIN:
        return "bueno"
    if score >= LIFESTYLE_REGULAR_MIN:
        return "regular"
    return "malo"


def nutrition_score_and_category(
    fruit_servings: int, veggie_servings: int, fiber_g: float, sugar_g: float, water_l: float
) -> tuple[int, str]:
    points = 0
    points += fruit_servings >= 2
    points += veggie_servings >= 3
    points += fiber_g >= 25
    points += sugar_g <= 50
    points += water_l >= 2

    if points >= 5:
        category = "excelente"
    elif points >= 4:
        category = "buena"
    elif points >= 2:
        category = "regular"
    else:
        category = "deficiente"
    return points, category


# Categorías de edad BRFSS 2015 (1-13), tal como las espera Modelo 1.
_BRFSS_AGE_BUCKETS = [
    (18, 24, 1), (25, 29, 2), (30, 34, 3), (35, 39, 4), (40, 44, 5),
    (45, 49, 6), (50, 54, 7), (55, 59, 8), (60, 64, 9), (65, 69, 10),
    (70, 74, 11), (75, 79, 12), (80, 200, 13),
]


def age_to_brfss_bucket(age: int) -> int:
    if age < 18:
        return 1
    for lo, hi, code in _BRFSS_AGE_BUCKETS:
        if lo <= age <= hi:
            return code
    return 13


def age_years(birth_date) -> int:
    if isinstance(birth_date, str):
        birth_date = date.fromisoformat(birth_date)
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
