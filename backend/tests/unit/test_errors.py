"""Tests for the public API error envelope."""

from fastapi import Query
from fastapi.testclient import TestClient

from app.main import app


def test_http_errors_use_structured_envelope() -> None:
    with TestClient(app) as client:
        response = client.get("/missing-route")

    assert response.status_code == 404
    assert response.json() == {
        "error": {"code": "http_404", "message": "Not Found"}
    }


def test_validation_errors_use_structured_envelope() -> None:
    def validation_probe(count: int = Query(...)) -> dict[str, int]:
        return {"count": count}

    app.add_api_route("/_test/validation", validation_probe, methods=["GET"])
    route = app.router.routes[-1]
    try:
        with TestClient(app) as client:
            response = client.get("/_test/validation", params={"count": "not-a-number"})
    finally:
        app.router.routes.remove(route)

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert response.json()["error"]["details"][0]["location"] == "query.count"


def test_unhandled_errors_do_not_expose_internal_messages() -> None:
    def failing_probe() -> None:
        raise RuntimeError("sensitive internal detail")

    app.add_api_route("/_test/failure", failing_probe, methods=["GET"])
    route = app.router.routes[-1]
    try:
        with TestClient(app, raise_server_exceptions=False) as client:
            response = client.get("/_test/failure")
    finally:
        app.router.routes.remove(route)

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "code": "internal_error",
            "message": "An internal server error occurred",
        }
    }
    assert "sensitive internal detail" not in response.text
