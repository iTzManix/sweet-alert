# Backend — Diabetes Risk API

FastAPI + Supabase (Auth + Postgres) + 3 modelos scikit-learn + LLM vía
OpenRouter. Ver [`../docs/api.md`](../docs/api.md) para el contrato completo
de la API y [`../docs/proyecto.md`](../docs/proyecto.md) para arquitectura y
decisiones del proyecto.

## Quickstart

```bash
python -m venv ../.venv && source ../.venv/bin/activate   # o ../.venv/bin/activate.fish
pip install -r requirements.txt
cp .env.example .env   # completar SUPABASE_SERVICE_ROLE_KEY y OPENROUTER_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Tests: `pytest` (Supabase y el LLM van mockeados, no hace falta red)

El `--host 0.0.0.0` es necesario si el frontend corre en un dispositivo
físico vía Expo Go (necesita la IP de la máquina, no `localhost`).
