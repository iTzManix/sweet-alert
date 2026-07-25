from fastapi import APIRouter, Depends, HTTPException

from ..schemas.profile import ProfileIn, ProfileOut
from ..security import get_current_user_id
from ..supabase_client import supabase

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get(
    "",
    response_model=ProfileOut,
    summary="Obtener el perfil del usuario autenticado",
    responses={404: {"description": "El usuario todavía no completó su perfil"}},
)
def get_profile(user_id: str = Depends(get_current_user_id)):
    res = supabase.table("profiles").select("*").eq("id", user_id).limit(1).execute()
    if not res.data:
        raise HTTPException(404, "Perfil no encontrado, complétalo primero con PUT /profile")
    return res.data[0]


@router.put(
    "",
    response_model=ProfileOut,
    summary="Crear o actualizar el perfil del usuario autenticado",
    description="Upsert: si el usuario ya tiene perfil lo reemplaza, si no lo crea.",
)
def upsert_profile(body: ProfileIn, user_id: str = Depends(get_current_user_id)):
    payload = body.model_dump(mode="json")
    payload["id"] = user_id
    res = supabase.table("profiles").upsert(payload).execute()
    return res.data[0]
