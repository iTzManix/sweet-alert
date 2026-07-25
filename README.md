# Diabetes Risk App

App que estima riesgo de diabetes combinando 3 modelos de Machine Learning
(riesgo, síntomas tempranos, estilo de vida), un score nutricional por
fórmula, y un LLM que traduce todo eso en recomendaciones accionables. No
diagnostica: clasifica nivel de riesgo, como un cuestionario clínico tipo
FINDRISC automatizado.

## Estructura del repo

```
.
├── backend/           API en FastAPI (ver backend/README o docs/api.md)
├── models_artifacts/  Modelos entrenados (*.joblib), consumidos por el backend
├── notebooks/         Notebooks de entrenamiento (uno por modelo)
├── data/              Datasets crudos usados para entrenar (CSV)
└── docs/
    ├── proyecto.md          Documentación del proyecto: fases, decisiones, resultados
    ├── api.md               Contrato de la API para quien haga el frontend
    └── proyecto_original.docx  Documento de planificación original (referencia histórica)
```

## Quickstart (backend)

```bash
cd backend
python -m venv ../.venv && source ../.venv/bin/activate   # o el venv que ya exista en la raíz
pip install -r requirements.txt
cp .env.example .env   # completar SUPABASE_SERVICE_ROLE_KEY y OPENROUTER_API_KEY
uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/docs
- Tests: `pytest` desde `backend/` (Supabase y el LLM van mockeados, no hace falta red)

Ver [`docs/api.md`](docs/api.md) para el contrato completo de cada endpoint.

## Notebooks → modelos

Cada notebook en `notebooks/` entrena y compara 2 algoritmos, guarda el
ganador (por Recall) en `models_artifacts/`, y corre asumiendo que se ejecuta
desde `notebooks/` (paths relativos a `../data` y `../models_artifacts`).

| Notebook | Modelo que produce |
|---|---|
| `PrediccionRiesgo.ipynb` | `modelo1_riesgo_diabetes.joblib` |
| `EstiloVida.ipynb` | `modelo2_estilo_vida.joblib` |
| `DeteccionSintomasTempranos.ipynb` | `modelo3_sintomas_tempranos.joblib` |
| `Nutricion.ipynb` | `modelo4_nutricion.joblib` (no se usa en el backend, ver `docs/proyecto.md`) |

## Documentación

- [`docs/proyecto.md`](docs/proyecto.md) — arquitectura, decisiones de cada
  modelo, resultados reales de entrenamiento, estado actual.
- [`docs/api.md`](docs/api.md) — referencia de la API para el frontend.
