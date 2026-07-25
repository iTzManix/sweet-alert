"""Adapter del LLM vía OpenRouter. Contrato de salida fijo en JSON para que
Saúl lo pinte directo en la app, sin parseo de texto libre.
"""

import asyncio
import json

import httpx

from ..config import OPENROUTER_API_KEY, OPENROUTER_MODEL

# Los modelos ":free" de OpenRouter comparten cupo entre todos sus usuarios
# y devuelven 429 seguido. Reintento corto con backoff antes de fallar.
_RETRYABLE_STATUS = {429, 502, 503}
_MAX_ATTEMPTS = 3

SYSTEM_PROMPT = """Eres un asistente de salud que traduce resultados de un cuestionario de riesgo \
de diabetes en recomendaciones claras y accionables. No diagnosticas ni das \
consejo médico definitivo, solo orientas hábitos. Respondes EXCLUSIVAMENTE \
con un JSON válido, sin texto fuera de él, con este formato exacto:
{
  "resumen": "1-2 frases explicando el riesgo en lenguaje simple, sin jerga clínica",
  "factor_principal": "el factor que más está influyendo en el riesgo actual",
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
}"""


async def generate_recommendation(scores: dict) -> dict:
    user_prompt = "Resultados del usuario:\n" + json.dumps(scores, ensure_ascii=False, indent=2)
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(1, _MAX_ATTEMPTS + 1):
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
                json=payload,
            )
            if response.status_code in _RETRYABLE_STATUS and attempt < _MAX_ATTEMPTS:
                await asyncio.sleep(2**attempt)
                continue
            response.raise_for_status()

            content = response.json()["choices"][0]["message"]["content"]
            # Algunos modelos "reasoning" (ej. modelos :free con chain-of-thought)
            # a veces gastan su respuesta entera pensando y devuelven content
            # vacío/None. Se trata igual que un fallo transitorio: reintentar.
            if content:
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    pass
            if attempt < _MAX_ATTEMPTS:
                await asyncio.sleep(2**attempt)
                continue
            raise RuntimeError("El LLM no devolvió un JSON válido tras varios intentos")
