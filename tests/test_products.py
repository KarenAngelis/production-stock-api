"""Three HTTP scenarios based on the official FastAPI testing tutorial."""

from decimal import Decimal


def test_create_and_get_product_success(client):
    payload = {"code": "TEST-001", "name": "Test product", "value": "19.90"}

    response = client.post("/products/", json=payload)

    # This API currently returns 200 on creation (not 201).
    assert response.status_code == 200
    product = response.json()
    assert isinstance(product["id"], int)
    assert product["id"] > 0
    assert product["code"] == payload["code"]
    assert product["name"] == payload["name"]
    assert Decimal(str(product["value"])) == Decimal("19.90")

    # A second HTTP request proves the product was persisted.
    fetched = client.get(f"/products/{product['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == product


def test_create_product_rejects_invalid_value(client):
    payload = {"code": "INVALID-001", "name": "Invalid product", "value": "not-a-number"}

    response = client.post("/products/", json=payload)

    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error["loc"] == ["body", "value"] for error in errors)
    products = client.get("/products/")
    assert products.status_code == 200
    assert products.json() == []


def test_get_nonexistent_product_returns_404(client):
    response = client.get("/products/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}
