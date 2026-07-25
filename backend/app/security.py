from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .supabase_client import supabase

bearer_scheme = HTTPBearer(description="Access token que devuelve Supabase Auth al iniciar sesión")


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    try:
        result = supabase.auth.get_user(credentials.credentials)
    except Exception:
        raise HTTPException(401, "Token inválido")

    if not result or not result.user:
        raise HTTPException(401, "Token inválido")

    return result.user.id
