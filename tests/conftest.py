"""Run the real API against disposable SQLite databases, never a configured DB."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture(scope="session")
def api(tmp_path_factory):
    # main.py creates tables on import. Redirect that startup before importing it.
    startup_db = tmp_path_factory.mktemp("api-startup") / "startup.sqlite"
    with pytest.MonkeyPatch.context() as patch:
        patch.setenv("DATABASE_URL", f"sqlite:///{startup_db.as_posix()}")
        patch.setenv("STRICT_DB", "0")
        from app.main import app
        from app.database import engine

        try:
            yield app
        finally:
            engine.dispose()


@pytest.fixture
def client(api):
    from app.database import Base, get_db

    # Each test starts with a fresh database shared by TestClient's threads.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)

    def override_get_db():
        with testing_session() as session:
            yield session

    previous_overrides = api.dependency_overrides.copy()
    api.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(api) as test_client:
            yield test_client
    finally:
        api.dependency_overrides.clear()
        api.dependency_overrides.update(previous_overrides)
        engine.dispose()
