import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Caminho absoluto do .env dentro da pasta app
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

# Carrega o .env e mostra se carregou
loaded = load_dotenv(dotenv_path=ENV_PATH)
print(f"ENV loaded: {loaded} | ENV_PATH: {ENV_PATH}")

DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ modo estrito: se você quer Postgres, não deixa cair pra SQLite sem perceber
STRICT_DB = os.getenv("STRICT_DB", "0") == "1"

if not DATABASE_URL:
    if STRICT_DB:
        raise RuntimeError("DATABASE_URL não encontrada (STRICT_DB=1). Verifique app/.env")
    sqlite_path = os.path.join(os.path.dirname(__file__), "production_stock.db")
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    print("⚠️ DATABASE_URL não encontrada. Usando SQLite local.")

print("DB URL:", DATABASE_URL)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
