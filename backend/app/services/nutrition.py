from ..schemas.assessment import AssessmentIn
from ..thresholds import nutrition_score_and_category


def compute(body: AssessmentIn) -> tuple[int, str]:
    return nutrition_score_and_category(
        body.fruit_servings, body.veggie_servings, body.fiber_g, body.sugar_g, body.water_l
    )
