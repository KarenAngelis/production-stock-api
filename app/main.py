from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# ✅ IMPORTA OS MODELS (pra registrar no Base antes do create_all)
from app.models.product import Product  # noqa: F401
from app.models.raw_material import RawMaterial  # noqa: F401
from app.models.product_raw_material import ProductRawMaterial  # noqa: F401
from app.models.stock_movement import StockMovement  # noqa: F401

# Routers
from app.routers.product import router as product_router
from app.routers.raw_material import router as raw_material_router
from app.routers.product_raw_material import router as product_raw_material_router
from app.routers.production import router as production_router
from app.routers.stock_movements import router as stock_movements_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Production Stock API",
        version="1.0.0",
    )

    # ✅ Create tables (agora com models carregados)
    Base.metadata.create_all(bind=engine)

    # CORS (React)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(product_router)
    app.include_router(raw_material_router)
    app.include_router(product_raw_material_router)
    app.include_router(production_router)
    app.include_router(stock_movements_router)

    @app.get("/")
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
