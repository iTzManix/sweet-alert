"""Camino crítico: algunos modelos ':free' de OpenRouter (con razonamiento
oculto) a veces devuelven content=None en vez de JSON. Se descubrió probando
distintos escenarios de riesgo a mano (1 de 5 fallaba). Estos tests fijan el
comportamiento de reintento sin depender de la red real ni de una API key.
"""

import asyncio
import json
from unittest.mock import AsyncMock, patch

import httpx

from app.services.llm import generate_recommendation

_URL = "https://openrouter.ai/api/v1/chat/completions"
_VALID_JSON = json.dumps({"resumen": "ok", "factor_principal": "x", "recomendaciones": ["a"]})


def _fake_response(content):
    request = httpx.Request("POST", _URL)
    return httpx.Response(200, json={"choices": [{"message": {"content": content}}]}, request=request)


def test_retries_when_content_is_null():
    responses = [_fake_response(None), _fake_response(_VALID_JSON)]

    async def fake_post(*_args, **_kwargs):
        return responses.pop(0)

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)), patch(
        "asyncio.sleep", new=AsyncMock()
    ):
        result = asyncio.run(generate_recommendation({"riesgo_diabetes": {"probabilidad": 0.5, "nivel": "moderado"}}))

    assert result == {"resumen": "ok", "factor_principal": "x", "recomendaciones": ["a"]}


def test_retries_on_malformed_json_then_succeeds():
    responses = [_fake_response("esto no es json"), _fake_response(_VALID_JSON)]

    async def fake_post(*_args, **_kwargs):
        return responses.pop(0)

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)), patch(
        "asyncio.sleep", new=AsyncMock()
    ):
        result = asyncio.run(generate_recommendation({"riesgo_diabetes": {"probabilidad": 0.5, "nivel": "moderado"}}))

    assert result["resumen"] == "ok"


def test_raises_after_exhausting_retries_on_null_content():
    async def fake_post(*_args, **_kwargs):
        return _fake_response(None)

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)), patch(
        "asyncio.sleep", new=AsyncMock()
    ):
        try:
            asyncio.run(generate_recommendation({"riesgo_diabetes": {"probabilidad": 0.5, "nivel": "moderado"}}))
        except RuntimeError:
            return
    raise AssertionError("se esperaba RuntimeError tras agotar los reintentos")
