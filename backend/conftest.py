"""Fixtures compartidos. Vive en backend/ (no en tests/) para que pytest
agregue este directorio a sys.path y `import app...` funcione sin hacks.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.security import get_current_user_id

TEST_USER_ID = "11111111-1111-1111-1111-111111111111"


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeTable:
    """Doble de prueba minimo del query builder de supabase-py.

    Filtra de verdad por .eq() (necesario para probar ownership en
    update/delete); alcanza con soportar AND de igualdad, que es todo lo que
    usan las rutas reales.
    """

    def __init__(self, store: dict, name: str):
        self.store = store
        self.name = name
        self._mode = None
        self._result = None
        self._filters: dict = {}

    def select(self, *_a, **_k):
        self._mode = "select"
        return self

    def eq(self, field, value):
        self._filters[field] = value
        return self

    def limit(self, *_a, **_k):
        return self

    def order(self, *_a, **_k):
        return self

    def _matches(self, row):
        return all(row.get(k) == v for k, v in self._filters.items())

    def insert(self, payload):
        row = {**payload, "id": "22222222-2222-2222-2222-222222222222", "created_at": "2026-07-25T00:00:00Z"}
        self.store.setdefault(self.name, []).append(row)
        self._result = [row]
        self._mode = "write"
        return self

    def upsert(self, payload):
        self.store[self.name] = [payload]
        self._result = [payload]
        self._mode = "write"
        return self

    def update(self, payload):
        rows = self.store.get(self.name, [])
        matched = [r for r in rows if self._matches(r)]
        for r in matched:
            r.update(payload)
        self._result = matched
        self._mode = "write"
        return self

    def delete(self):
        rows = self.store.get(self.name, [])
        self.store[self.name] = [r for r in rows if not self._matches(r)]
        self._result = [r for r in rows if self._matches(r)]
        self._mode = "write"
        return self

    def execute(self):
        if self._mode == "select":
            rows = self.store.get(self.name, [])
            if self._filters:
                rows = [r for r in rows if self._matches(r)]
            return FakeResult(rows)
        return FakeResult(self._result)


class FakeSupabaseClient:
    def __init__(self):
        self.store: dict = {}

    def table(self, name):
        return FakeTable(self.store, name)


async def _fake_generate_recommendation(scores):
    return {
        "resumen": "resumen de prueba",
        "factor_principal": "factor de prueba",
        "recomendaciones": ["uno", "dos", "tres"],
    }


@pytest.fixture
def fake_supabase(monkeypatch):
    fake = FakeSupabaseClient()
    monkeypatch.setattr("app.api.routes_profile.supabase", fake)
    monkeypatch.setattr("app.api.routes_assessments.supabase", fake)
    return fake


@pytest.fixture
def client(fake_supabase, monkeypatch):
    monkeypatch.setattr("app.services.llm.generate_recommendation", _fake_generate_recommendation)
    app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_profile_payload():
    return {
        "sex": "F",
        "birth_date": "1990-05-20",
        "height_cm": 165,
        "education_level": 4,
        "income_level": 5,
        "occupation": "Nurse",
    }


@pytest.fixture
def sample_assessment_payload():
    return {
        "weight_kg": 70,
        "high_bp": True,
        "high_chol": True,
        "chol_check": True,
        "smoker": False,
        "stroke": False,
        "heart_disease": False,
        "phys_activity": True,
        "fruits": True,
        "veggies": True,
        "hvy_alcohol": False,
        "any_healthcare": True,
        "no_doc_cost": False,
        "gen_health": 3,
        "ment_health_days": 2,
        "phys_health_days": 1,
        "diff_walk": False,
        "polyuria": False,
        "polydipsia": True,
        "sudden_weight_loss": False,
        "weakness": True,
        "polyphagia": False,
        "genital_thrush": False,
        "visual_blurring": False,
        "itching": False,
        "irritability": False,
        "delayed_healing": False,
        "partial_paresis": False,
        "muscle_stiffness": False,
        "alopecia": False,
        "obesity": False,
        "sleep_duration_hours": 6.5,
        "sleep_quality": 6,
        "physical_activity_level": 40,
        "stress_level": 7,
        "daily_steps": 6000,
        "heart_rate": 78,
        "daily_calories": 2100,
        "sugar_g": 45,
        "carbs_g": 250,
        "protein_g": 70,
        "fat_g": 60,
        "fiber_g": 20,
        "water_l": 1.8,
        "fruit_servings": 2,
        "veggie_servings": 3,
    }
