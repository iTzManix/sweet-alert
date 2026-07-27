# Proyecto — App de estimación de riesgo de diabetes

Versión actualizada del documento de planificación original
(`docs/proyecto_original.docx`), reflejando lo que realmente se implementó.
Las 5 fases planeadas se completaron; esta versión reemplaza las secciones
"se espera / se analizará" por los resultados reales.

## Arquitectura

```
Frontend (React Native / Expo) ──▶ Supabase Auth (login/signup directo)
     │
     ▼
Backend (FastAPI) ──▶ Supabase (Auth + Postgres: profiles, assessments)
     │
     ├─▶ Modelo 1 (riesgo de diabetes)     ─┐
     ├─▶ Modelo 2 (estilo de vida)          ├─▶ scores ──▶ LLM (OpenRouter) ──▶ recomendación
     ├─▶ Modelo 3 (síntomas tempranos)      │
     └─▶ Score de nutrición (fórmula)      ─┘
```

No se mezclan los datasets: cada modelo se entrena por separado y el backend
combina únicamente las **salidas** (probabilidades/categorías) en un solo
payload que se le pasa al LLM para generar la recomendación en lenguaje
natural. Ver `backend/app/api/routes_assessments.py`.

## Los 4 módulos

| Módulo | Objetivo | Dataset | ¿Cómo se usa en el backend? |
|---|---|---|---|
| Modelo 1 | Riesgo de diabetes | CDC Diabetes Health Indicators (BRFSS 2015) | Modelo ML real (`app/services/risk.py`) |
| Modelo 2 | Estilo de vida | Sleep Health and Lifestyle Dataset | Modelo ML para probabilidad de trastorno de sueño (señal secundaria) + categoría Excelente/Bueno/Regular/Malo **por fórmula** (`app/thresholds.py`) |
| Modelo 3 | Síntomas tempranos | Early Stage Diabetes Risk Prediction Dataset | Modelo ML real (`app/services/symptoms.py`) |
| Modelo 4 | Nutrición | Food Nutrition Dataset (Kaggle) | **No se usa en producción** — ver nota abajo. El score de nutrición del check-in se calcula por fórmula (`app/thresholds.py`) |

> **Nota sobre Modelo 4**: el dataset de nutrición tiene una fila por
> *alimento* (columnas `category`, `carbs`, `iron`, `vitamin_c`), no una fila
> por *usuario/día*. No hay forma de mapear el formulario de la app
> (calorías, azúcar, fibra, agua, porciones del día) a esas columnas sin
> inventar datos. El modelo se entrenó igual como parte del ejercicio (fase
> 5) pero el backend calcula el `nutrition_score` con una fórmula de puntos
> directamente sobre las respuestas del usuario. El `.joblib` queda guardado
> en `models_artifacts/` pero `app/models/registry.py` no lo carga a
> propósito.

## Resultados reales de entrenamiento (Fase 5)

Se compararon 2 algoritmos por módulo y se seleccionó el ganador priorizando
**Recall** (en salud es peor un falso negativo que una falsa alarma).

| Módulo | Algoritmo 1 | Algoritmo 2 | Ganador | Accuracy | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|---|---|
| Riesgo de diabetes | Logistic Regression | Random Forest | **Logistic Regression** | 0.714 | **0.760** | 0.449 | 0.811 |
| Síntomas tempranos | Logistic Regression | SVM | **SVM** | 0.922 | **0.914** | 0.941 | 0.966 |
| Estilo de vida | Decision Tree | Random Forest | **Decision Tree** (empate, se prioriza el más simple) | 0.827 | 0.827 | 0.835 | — |
| Nutrición (no usado en prod) | Decision Tree | Random Forest | Decision Tree | 0.683 | 0.683 | 0.683 | — |

Notas:
- **Modelo 1**: se prefirió Logistic Regression sobre Random Forest a pesar
  de menor accuracy, porque su Recall (0.76 vs 0.44) detecta muchos más
  casos reales de riesgo — a costa de más falsos positivos, aceptable para
  un cuestionario de screening, no un diagnóstico.
- **Modelo 3**: SVM con probabilidades calibradas (`probability=True`),
  dataset pequeño (516 filas) pero con separación muy clara entre clases.
- **Modelo 2**: el target real del dataset es el trastorno de sueño
  (None/Insomnia/Sleep Apnea), no una categoría de "estilo de vida". Por eso
  se usa como señal secundaria (`sleep_disorder_probability`) y la categoría
  que ve el usuario (Excelente/Bueno/Regular/Malo) se calcula aparte por
  fórmula ponderada sobre sueño, actividad física y estrés.

Todos los pipelines (`ColumnTransformer` + imputación + escalado/one-hot +
clasificador) están serializados en `models_artifacts/*.joblib` y se cargan
una vez al arrancar el backend (`app/models/registry.py`, hook `lifespan` de
FastAPI).

## Umbrales de negocio

Definidos en `backend/app/thresholds.py`, calibrados contra la tasa real de
positivos en los datasets de prueba:

- **Riesgo / síntomas**: `bajo` <0.30, `moderado` 0.30–0.60, `alto` ≥0.60.
- **Estilo de vida**: score ponderado (sueño 25% + calidad sueño 25% +
  actividad 25% + inverso del estrés 25%) → `excelente` ≥0.75, `bueno`
  ≥0.55, `regular` ≥0.35, si no `malo`.
- **Nutrición**: 5 puntos posibles (fruta, verdura, fibra, azúcar, agua) →
  5pts `excelente`, 4pts `buena`, 2-3pts `regular`, si no `deficiente`.

## Backend

FastAPI + Supabase (Postgres + Auth) + modelos scikit-learn + LLM vía
OpenRouter. Ver [`docs/api.md`](./api.md) para el contrato de la API
(endpoints, request/response, ejemplos) — pensado para quien construya el
frontend.

Estructura relevante:

```
backend/
├── app/
│   ├── main.py              FastAPI app, carga los modelos al arrancar
│   ├── config.py            Variables de entorno (.env)
│   ├── security.py          Valida el Bearer token contra Supabase Auth
│   ├── supabase_client.py   Cliente de Supabase (service_role key)
│   ├── thresholds.py        Umbrales/fórmulas de negocio
│   ├── api/                 Rutas: /profile, /assessments (GET/POST/PUT/DELETE)
│   ├── schemas/              Pydantic: validación de entrada/salida
│   ├── services/             risk, symptoms, lifestyle, nutrition, llm
│   └── models/registry.py   Carga de los .joblib
└── tests/                    27 tests, Supabase y LLM mockeados
```

`PUT /assessments/{id}` y `DELETE /assessments/{id}` permiten editar (recalculando
los 3 modelos + LLM sobre el mismo registro) o borrar un check-in del
historial — pensado para que el front permita corregir un check-in mal
llenado sin dejar duplicados. CORS está habilitado (`allow_origins=["*"]`,
sin credentials) para que el frontend pueda llamar al backend tanto desde
apps nativas como desde el preview web de Expo.

### Base de datos (Supabase)

Dos tablas en `public`, ambas con `id`/`user_id` referenciando `auth.users`:

- **`profiles`**: 1 fila por usuario (sexo, fecha de nacimiento, estatura,
  educación, ingresos, ocupación).
- **`assessments`**: 1 fila por check-in, con todas las respuestas del
  formulario + los resultados calculados (probabilidades, niveles,
  categorías, recomendación del LLM en `jsonb`).

RLS está habilitado en ambas tablas, pero **el backend usa la `service_role`
key** (bypassa RLS) y filtra manualmente por `user_id` extraído del token —
por eso los roles/policies de Supabase no son críticos para este MVP: el
control de acceso vive en el backend, no en políticas de Postgres. Si el
proyecto crece más allá del MVP, vale la pena mover ese filtrado a políticas
RLS reales usando el `anon`/`authenticated` key en vez de `service_role`.

### LLM

OpenRouter (`OPENROUTER_MODEL`, default `openai/gpt-4o-mini`) recibe los
scores de los 3 módulos + nutrición y devuelve **siempre** este JSON:

```json
{ "resumen": "...", "factor_principal": "...", "recomendaciones": ["...", "...", "..."] }
```

Reintenta hasta 3 veces con backoff ante 429/502/503 o respuesta vacía
(común en modelos `:free` de OpenRouter que agotan la respuesta "pensando").

## Frontend

React Native con Expo SDK 57, TypeScript, `expo-router` (file-based) y
NativeWind (Tailwind) para los estilos. Vive en `frontend/`, ver
[`frontend/README.md`](../frontend/README.md) para el detalle completo de
pantallas y decisiones de diseño.

Puntos clave:

- **Auth**: `@supabase/supabase-js` directo desde el cliente (login/signup
  simples con email + contraseña, sin Google ni verificación de correo — MVP).
- **Onboarding y check-in como wizards**: en vez de un formulario largo, cada
  flujo se parte en fases con barra de progreso, guardando el borrador en
  AsyncStorage para poder retomarlo si se cierra la app a medias.
- **Historial editable**: cada check-in del historial se puede abrir (ver
  todas las respuestas), editar (recalcula con `PUT /assessments/{id}`) o
  eliminar (`DELETE /assessments/{id}`).
- Sin librerías de estado/formularios adicionales (Context + `useReducer`
  alcanza para 3 endpoints); sin gráfico de tendencia ni modo oscuro en este
  MVP.

## Estado (2026-07-27)

- ✅ Los 4 modelos entrenados y exportados (`models_artifacts/*.joblib`).
- ✅ Backend funcionando: 27 tests pasan, conexión con OpenRouter verificada
  en vivo, tablas `profiles`/`assessments` existen en el proyecto de
  Supabase real y coinciden con los schemas de la API. Incluye editar/borrar
  check-ins (`PUT`/`DELETE /assessments/{id}`) y CORS habilitado.
- ✅ Frontend funcionando (Expo SDK 57): login/signup, onboarding de perfil,
  check-in por fases, historial con ver/editar/eliminar.
- ✅ Documentación de API para el front (`docs/api.md`).
- ⚠️ Pendiente: cargar la `service_role` key real de Supabase en
  `backend/.env` (el valor actual es un placeholder).
- ⏸️ Roles/policies de Supabase: no se implementan para el MVP (ver nota de
  RLS arriba); el control de acceso es por `user_id` en el backend.
