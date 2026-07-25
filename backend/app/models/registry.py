"""Carga los pipelines de sklearn exportados por los notebooks (models_artifacts/*.joblib).

Modelo 4 (nutrición) no se carga aquí a propósito: opera sobre columnas
por-alimento que no coinciden con el formulario de la app (ver Nutricion.ipynb).
El score de nutrición se calcula por fórmula en app/thresholds.py.
"""

import joblib

from ..config import MODELS_DIR

_pipelines: dict = {}


def load_models() -> None:
    _pipelines["risk"] = joblib.load(MODELS_DIR / "modelo1_riesgo_diabetes.joblib")
    _pipelines["lifestyle"] = joblib.load(MODELS_DIR / "modelo2_estilo_vida.joblib")
    _pipelines["symptoms"] = joblib.load(MODELS_DIR / "modelo3_sintomas_tempranos.joblib")


def risk_pipeline():
    return _pipelines["risk"]


def lifestyle_pipeline():
    return _pipelines["lifestyle"]


def symptoms_pipeline():
    return _pipelines["symptoms"]
