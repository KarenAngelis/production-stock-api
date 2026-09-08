"""API-level stock invariants, including a real flush followed by rollback."""
from decimal import Decimal

import pytest
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def material(client, quantity=10):
    response = client.post('/raw-materials/', json={
        'code': 'DEMO-RM', 'name': 'Fictional component', 'stock_quantity': quantity,
    })
    assert response.status_code == 200
    return response.json()['id']


def move(client, item_id, quantity, direction='out'):
    return client.post('/stock-movements/', json={
        'item_type': 'raw_material', 'item_id': item_id,
        'movement_type': direction, 'quantity': quantity, 'reason': 'Test only',
    })


def balance(client):
    return Decimal(str(client.get('/raw-materials/').json()[0]['stock_quantity']))


def test_insufficient_stock_preserves_balance_and_ledger(client):
    item_id = material(client, 10)
    response = move(client, item_id, 11)
    assert response.status_code == 400
    assert 'Insufficient stock' in response.json()['detail']
    assert balance(client) == 10
    assert client.get('/stock-movements/').json() == []


def test_withdrawing_exact_balance_records_one_movement(client):
    item_id = material(client, 10)
    response = move(client, item_id, 10)
    assert response.status_code == 200
    assert balance(client) == 0
    entries = client.get('/stock-movements/').json()
    assert len(entries) == 1
    assert entries[0]['id'] == response.json()['id']
    assert Decimal(str(entries[0]['quantity'])) == 10


def test_failed_commit_rolls_back_stock_and_movement(client):
    item_id = material(client, 10)

    def fail_after_database_writes(session):
        session.flush()  # Execute INSERT and UPDATE, then fail before commit.
        raise SQLAlchemyError('Injected failure containing private database details')

    event.listen(Session, 'before_commit', fail_after_database_writes)
    try:
        response = move(client, item_id, 4)
    finally:
        event.remove(Session, 'before_commit', fail_after_database_writes)
    assert response.status_code == 500
    assert response.json() == {'detail': 'Unable to save stock movement'}
    # Fresh HTTP requests use new sessions and observe the durable state.
    assert balance(client) == 10
    assert client.get('/stock-movements/').json() == []


@pytest.mark.parametrize('quantity', [0, -1])
def test_nonpositive_movement_is_rejected(client, quantity):
    item_id = material(client)
    assert move(client, item_id, quantity).status_code == 422
    assert balance(client) == 10
    assert client.get('/stock-movements/').json() == []
