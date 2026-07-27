from fastapi import APIRouter, Depends, HTTPException, Response

from ..models import registry
from ..schemas.assessment import AssessmentIn, AssessmentOut
from ..security import get_current_user_id
from ..services import lifestyle, llm, nutrition, risk, symptoms
from ..supabase_client import supabase

router = APIRouter(prefix="/assessments", tags=["assessments"])


def _get_profile(user_id: str) -> dict:
    profile_res = supabase.table("profiles").select("*").eq("id", user_id).limit(1).execute()
    if not profile_res.data:
        raise HTTPException(400, "Completa tu perfil (PUT /profile) antes de enviar una evaluación")
    return profile_res.data[0]


def _get_owned_assessment(assessment_id: str, user_id: str) -> dict:
    res = (
        supabase.table("assessments")
        .select("id")
        .eq("id", assessment_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Evaluación no encontrada")
    return res.data[0]


async def _run_models(profile: dict, body: AssessmentIn) -> dict:
    """Corre los 3 modelos de ML + score de nutrición + LLM, arma el row a guardar."""
    risk_probability, risk_level = risk.predict(registry.risk_pipeline(), profile, body)
    symptoms_probability, symptoms_level = symptoms.predict(registry.symptoms_pipeline(), profile, body)
    sleep_disorder_probability, lifestyle_cat = lifestyle.predict(registry.lifestyle_pipeline(), profile, body)
    nutrition_score, nutrition_cat = nutrition.compute(body)

    recommendation = await llm.generate_recommendation(
        {
            "riesgo_diabetes": {"probabilidad": round(risk_probability, 3), "nivel": risk_level},
            "sintomas": {"probabilidad": round(symptoms_probability, 3), "nivel": symptoms_level},
            "estilo_vida": lifestyle_cat,
            "nutricion": nutrition_cat,
        }
    )

    row = body.model_dump(mode="json")
    row.update(
        {
            "risk_probability": risk_probability,
            "risk_level": risk_level,
            "symptoms_probability": symptoms_probability,
            "symptoms_level": symptoms_level,
            "sleep_disorder_probability": sleep_disorder_probability,
            "lifestyle_category": lifestyle_cat,
            "nutrition_score": nutrition_score,
            "nutrition_category": nutrition_cat,
            "llm_recommendation": recommendation,
        }
    )
    return row


@router.post(
    "",
    response_model=AssessmentOut,
    summary="Enviar un check-in y obtener riesgo + recomendaciones",
    description=(
        "Corre los 3 modelos de ML (riesgo, síntomas, estilo de vida) más el score "
        "de nutrición, le pide al LLM una recomendación en el formato fijo, guarda "
        "todo en el historial del usuario y devuelve el resultado completo."
    ),
    responses={400: {"description": "El usuario todavía no completó su perfil (PUT /profile)"}},
)
async def create_assessment(body: AssessmentIn, user_id: str = Depends(get_current_user_id)):
    profile = _get_profile(user_id)
    row = await _run_models(profile, body)
    row["user_id"] = user_id
    saved = supabase.table("assessments").insert(row).execute()
    return saved.data[0]


@router.get(
    "",
    response_model=list[AssessmentOut],
    summary="Historial de evaluaciones del usuario autenticado",
    description="Más reciente primero.",
)
def list_assessments(user_id: str = Depends(get_current_user_id)):
    res = (
        supabase.table("assessments")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.put(
    "/{assessment_id}",
    response_model=AssessmentOut,
    summary="Editar un check-in existente y recalcular riesgo + recomendaciones",
    responses={
        404: {"description": "La evaluación no existe o no pertenece al usuario"},
        400: {"description": "El usuario todavía no completó su perfil (PUT /profile)"},
    },
)
async def update_assessment(assessment_id: str, body: AssessmentIn, user_id: str = Depends(get_current_user_id)):
    _get_owned_assessment(assessment_id, user_id)
    profile = _get_profile(user_id)
    row = await _run_models(profile, body)
    updated = supabase.table("assessments").update(row).eq("id", assessment_id).eq("user_id", user_id).execute()
    return updated.data[0]


@router.delete(
    "/{assessment_id}",
    status_code=204,
    summary="Eliminar un check-in del historial",
    responses={404: {"description": "La evaluación no existe o no pertenece al usuario"}},
)
def delete_assessment(assessment_id: str, user_id: str = Depends(get_current_user_id)):
    _get_owned_assessment(assessment_id, user_id)
    supabase.table("assessments").delete().eq("id", assessment_id).eq("user_id", user_id).execute()
    return Response(status_code=204)
