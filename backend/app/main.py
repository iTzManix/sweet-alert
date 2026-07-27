from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes_assessments, routes_profile
from .models import registry

DESCRIPTION = """
Backend de la app de estimación de riesgo de diabetes.

Combina 3 modelos de Machine Learning (riesgo de diabetes, síntomas tempranos,
estilo de vida) entrenados sobre datasets del CDC/BRFSS, un cálculo de score
nutricional por fórmula, y un LLM que traduce esos resultados en
recomendaciones. No diagnostica: clasifica nivel de riesgo, como un
cuestionario clínico tipo FINDRISC automatizado.

**Autenticación**: todas las rutas (excepto `/health`) requieren un
`Authorization: Bearer <access_token>` emitido por Supabase Auth.
"""

tags_metadata = [
    {"name": "profile", "description": "Datos del usuario que no cambian entre check-ins (sexo, edad, estatura, etc.)."},
    {"name": "assessments", "description": "Evaluaciones de riesgo: envío de un check-in y consulta del historial."},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.load_models()
    yield


app = FastAPI(
    title="Diabetes Risk API",
    description=DESCRIPTION,
    version="0.1.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(routes_profile.router)
app.include_router(routes_assessments.router)


@app.get("/health", tags=["health"], summary="Chequeo de salud del servicio")
def health():
    return {"status": "ok"}
