from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.raw_material import RawMaterial
from app.schemas.raw_material import RawMaterialCreate, RawMaterialResponse

router = APIRouter(prefix="/raw-materials", tags=["Raw Materials"])


@router.post("/", response_model=RawMaterialResponse)
def create_raw_material(raw_material: RawMaterialCreate, db: Session = Depends(get_db)):
    db_raw_material = RawMaterial(**raw_material.model_dump())
    db.add(db_raw_material)
    db.commit()
    db.refresh(db_raw_material)
    return db_raw_material


@router.get("/", response_model=list[RawMaterialResponse])
def list_raw_materials(db: Session = Depends(get_db)):
    return db.query(RawMaterial).all()


@router.delete("/{raw_material_id}")
def delete_raw_material(raw_material_id: int, db: Session = Depends(get_db)):
    raw_material = db.query(RawMaterial).filter(RawMaterial.id == raw_material_id).first()
    if not raw_material:
        raise HTTPException(status_code=404, detail="Raw material not found")

    db.delete(raw_material)
    db.commit()
    return {"message": "Raw material deleted successfully"}
