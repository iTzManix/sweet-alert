def test_health_ok(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_get_profile_404_when_missing(client):
    res = client.get("/profile")
    assert res.status_code == 404


def test_put_then_get_profile(client, sample_profile_payload):
    put_res = client.put("/profile", json=sample_profile_payload)
    assert put_res.status_code == 200
    assert put_res.json()["sex"] == "F"

    get_res = client.get("/profile")
    assert get_res.status_code == 200
    assert get_res.json()["height_cm"] == 165


def test_post_assessment_without_profile_is_400(client, sample_assessment_payload):
    res = client.post("/assessments", json=sample_assessment_payload)
    assert res.status_code == 400


def test_post_assessment_happy_path(client, sample_profile_payload, sample_assessment_payload):
    client.put("/profile", json=sample_profile_payload)

    res = client.post("/assessments", json=sample_assessment_payload)
    assert res.status_code == 200

    body = res.json()
    assert body["risk_level"] in {"bajo", "moderado", "alto"}
    assert body["symptoms_level"] in {"bajo", "moderado", "alto"}
    assert body["lifestyle_category"] in {"excelente", "bueno", "regular", "malo"}
    assert body["nutrition_category"] in {"excelente", "buena", "regular", "deficiente"}
    assert body["llm_recommendation"]["recomendaciones"]


def test_post_assessment_rejects_invalid_range(client, sample_profile_payload, sample_assessment_payload):
    client.put("/profile", json=sample_profile_payload)

    bad_payload = {**sample_assessment_payload, "gen_health": 99}
    res = client.post("/assessments", json=bad_payload)
    assert res.status_code == 422


def test_list_assessments_returns_saved_items(client, sample_profile_payload, sample_assessment_payload):
    client.put("/profile", json=sample_profile_payload)
    client.post("/assessments", json=sample_assessment_payload)

    res = client.get("/assessments")
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_endpoints_require_auth():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as anon_client:
        res = anon_client.get("/profile")
    assert res.status_code == 401
