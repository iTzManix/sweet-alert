from fastapi import APIRouter, Depends, HTTPException

from ..models import registry
from ..schemas.assessment import AssessmentIn, AssessmentOut
from ..security import get_current_user_id
from ..services import lifestyle, llm, nutrition, risk, symptoms
from ..supabase_client import supabase

router = APIRouter(prefix="/assessments", tags=["assessments"])


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
    profile_res = supabase.table("profiles").select("*").eq("id", user_id).limit(1).execute()
    if not profile_res.data:
        raise HTTPException(400, "Completa tu perfil (PUT /profile) antes de enviar una evaluación")
    profile = profile_res.data[0]

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
            "user_id": user_id,
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
