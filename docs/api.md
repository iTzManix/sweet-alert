# API — Diabetes Risk Backend

Referencia para quien construya el frontend. Generada a partir del schema
OpenAPI real del backend (`GET /openapi.json`, Swagger UI en `/docs`, ReDoc en
`/redoc` — con el server corriendo).

Base URL local: `http://localhost:8000`

## Autenticación

Todas las rutas, excepto `/health`, requieren un access token de Supabase Auth:

```
Authorization: Bearer <access_token>
```

Ese token es el que devuelve Supabase al hacer login desde el cliente
(supabase-js / supabase-flutter / lo que use el front). El backend lo valida
contra Supabase (`auth.get_user`) en cada request — no hay sesiones propias ni
roles: para este MVP, cualquier usuario autenticado puede leer y escribir
únicamente sus propios datos (filtrado por `user_id`, no por rol).

Si el token falta o es inválido: `401 {"detail": "Token inválido"}`.

## Flujo esperado del front

1. Login/signup contra Supabase Auth (directo desde el front, el backend no expone `/login`).
2. `PUT /profile` una vez, con los datos que no cambian (sexo, fecha de nacimiento, estatura, educación, ingresos, ocupación).
3. Por cada check-in: `POST /assessments` con el formulario completo del día → devuelve riesgo + recomendación del LLM en la misma respuesta.
4. `GET /assessments` para pintar el historial.

---

## `GET /health`

Sin autenticación. Chequeo de salud.

**Respuesta 200:**
```json
{ "status": "ok" }
```

---

## `GET /profile`

Devuelve el perfil del usuario autenticado.

- **200** → [`ProfileOut`](#profileout--profilein)
- **404** → `{"detail": "Perfil no encontrado, complétalo primero con PUT /profile"}`

## `PUT /profile`

Crea o reemplaza (upsert) el perfil del usuario autenticado.

**Body** ([`ProfileIn`](#profileout--profilein)):

| Campo | Tipo | Rango / valores | Descripción |
|---|---|---|---|
| `sex` | string | `"M"` \| `"F"` | Sexo biológico, tal como lo esperan los modelos |
| `birth_date` | string (date, `YYYY-MM-DD`) | — | Para derivar edad en cada check-in |
| `height_cm` | number | 100–250 | Estatura, para calcular IMC |
| `education_level` | int | 1–6 | Categoría educativa BRFSS (1=nunca asistió, 6=posgrado) |
| `income_level` | int | 1–8 | Categoría de ingresos BRFSS (1=más bajo, 8=más alto) |
| `occupation` | string \| null | opcional | Texto libre, ej. `"Nurse"` |

```json
{
  "sex": "F",
  "birth_date": "1990-05-20",
  "height_cm": 165,
  "education_level": 4,
  "income_level": 5,
  "occupation": "Nurse"
}
```

**200** → mismo objeto + `id` (igual al user id de Supabase Auth).

### `ProfileOut` / `ProfileIn`

`ProfileOut` = `ProfileIn` + `id: string`.

---

## `POST /assessments`

Envía un check-in completo. Corre los 3 modelos de ML (riesgo, síntomas,
estilo de vida) + el score de nutrición por fórmula, le pide al LLM una
recomendación, guarda todo en el historial del usuario y devuelve el
resultado completo en la misma respuesta.

- **400** si el usuario todavía no hizo `PUT /profile`.
- **422** si el body no valida (ver rangos abajo).

### Body (`AssessmentIn`)

Un solo objeto plano con los 3 formularios + nutrición del día. Todos los
campos son obligatorios.

**Modelo 1 — riesgo de diabetes**

| Campo | Tipo | Rango / valores |
|---|---|---|
| `weight_kg` | number | 20–300 |
| `high_bp`, `high_chol`, `chol_check`, `smoker`, `stroke`, `heart_disease`, `phys_activity`, `fruits`, `veggies`, `hvy_alcohol`, `any_healthcare`, `no_doc_cost`, `diff_walk` | boolean | — |
| `gen_health` | int | 1 (excelente) – 5 (malo) |
| `ment_health_days` | int | 0–30 |
| `phys_health_days` | int | 0–30 |

**Modelo 3 — síntomas tempranos** (todos boolean)

`polyuria`, `polydipsia`, `sudden_weight_loss`, `weakness`, `polyphagia`,
`genital_thrush`, `visual_blurring`, `itching`, `irritability`,
`delayed_healing`, `partial_paresis`, `muscle_stiffness`, `alopecia`, `obesity`

**Modelo 2 — estilo de vida**

| Campo | Tipo | Rango |
|---|---|---|
| `sleep_duration_hours` | number | 0–24 |
| `sleep_quality` | int | 1 (muy mala) – 10 (excelente) |
| `physical_activity_level` | int | 0–100 |
| `stress_level` | int | 1 (muy bajo) – 10 (muy alto) |
| `daily_steps` | int | 0–50000 |
| `heart_rate` | int | 40–200 |

**Nutrición (score por fórmula, sin ML)**

| Campo | Tipo | Rango |
|---|---|---|
| `daily_calories` | number | 500–6000 |
| `sugar_g`, `carbs_g`, `protein_g`, `fat_g`, `fiber_g` | number | ≥ 0 |
| `water_l` | number | 0–10 |
| `fruit_servings`, `veggie_servings` | int | 0–20 |

Ejemplo completo de body: ver `_EXAMPLE` en `backend/app/schemas/assessment.py`
o el "Try it out" de Swagger UI en `/docs`.

### Respuesta 200 (`AssessmentOut`)

```json
{
  "id": "…",
  "created_at": "2026-07-25T00:00:00Z",
  "risk_probability": 0.42,
  "risk_level": "moderado",
  "symptoms_probability": 0.1,
  "symptoms_level": "bajo",
  "sleep_disorder_probability": 0.05,
  "lifestyle_category": "bueno",
  "nutrition_score": 3,
  "nutrition_category": "regular",
  "llm_recommendation": {
    "resumen": "…",
    "factor_principal": "…",
    "recomendaciones": ["…", "…", "…"]
  }
}
```

| Campo | Descripción |
|---|---|
| `risk_probability` / `risk_level` | Probabilidad 0–1 y nivel (`bajo` <0.30, `moderado` 0.30–0.60, `alto` ≥0.60) de riesgo de diabetes (Modelo 1) |
| `symptoms_probability` / `symptoms_level` | Igual escala, para síntomas compatibles (Modelo 3) |
| `sleep_disorder_probability` | Señal secundaria del Modelo 2: probabilidad de un trastorno de sueño real (puede ser `null`) |
| `lifestyle_category` | `excelente` \| `bueno` \| `regular` \| `malo` — calculado por fórmula, no por el modelo |
| `nutrition_score` / `nutrition_category` | Score 0–5 y categoría (`excelente` \| `buena` \| `regular` \| `deficiente`), por fórmula |
| `llm_recommendation` | `resumen`, `factor_principal` y `recomendaciones` (array de 3 strings) generados por el LLM. Formato fijo, siempre estas 3 claves |

---

## `GET /assessments`

Historial del usuario autenticado, array de `AssessmentOut`, más reciente
primero. Array vacío si nunca hizo un check-in.

---

## Errores de validación (422)

Cualquier body que no cumpla los rangos de arriba devuelve `422` con el
formato estándar de FastAPI:

```json
{
  "detail": [
    { "loc": ["body", "gen_health"], "msg": "...", "type": "..." }
  ]
}
```

---

## Ver el contrato interactivo

Con el backend corriendo (`uvicorn app.main:app --reload` desde `backend/`):

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- JSON crudo: `http://localhost:8000/openapi.json`
