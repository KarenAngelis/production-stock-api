from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product_raw_material import ProductRawMaterial
from app.schemas.product_raw_material import (
    ProductRawMaterialCreate,
    ProductRawMaterialResponse
)

router = APIRouter(prefix="/product-raw-materials", tags=["Product Raw Materials"])


@router.get("/", response_model=list[ProductRawMaterialResponse])
def list_product_raw_materials(db: Session = Depends(get_db)):
    return db.query(ProductRawMaterial).all()


@router.post("/", response_model=ProductRawMaterialResponse)
def create_product_raw_material(data: ProductRawMaterialCreate, db: Session = Depends(get_db)):
    relation = ProductRawMaterial(**data.model_dump())
    db.add(relation)
    db.commit()
    db.refresh(relation)
    return relation
