import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

load_dotenv(".env")

url = os.getenv("DATABASE_URL")
print("DB URL:", url)

engine = create_engine(url, connect_args={"connect_timeout": 3})

try:
    with engine.connect() as conn:
        result = conn.execute(text("select 1")).scalar()
        print("Resultado:", result)
    print("✅ conectou no postgres")
except OperationalError as e:
    print("❌ falhou ao conectar no postgres")
    print(e)
