from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from decimal import Decimal

from app.database import get_db
from app.models.product import Product
from app.models.raw_material import RawMaterial
from app.models.stock_movement import StockMovement

from app.schemas.stock_movement import StockMovementCreate, StockMovementResponse

router = APIRouter(prefix="/stock-movements", tags=["Stock Movements"])


@router.get("/", response_model=list[StockMovementResponse])
def list_movements(db: Session = Depends(get_db)):
    movements = db.execute(
        select(StockMovement).order_by(StockMovement.created_at.desc())
    ).scalars().all()
    return movements


@router.post("/", response_model=StockMovementResponse)
def create_movement(payload: StockMovementCreate, db: Session = Depends(get_db)):
    if payload.item_type == "product":
        item = db.execute(select(Product).where(Product.id == payload.item_id).with_for_update()).scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Product not found")
    else:  # raw_material
        item = db.execute(select(RawMaterial).where(RawMaterial.id == payload.item_id).with_for_update()).scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Raw material not found")

    if not hasattr(item, "stock_quantity"):
        raise HTTPException(
            status_code=500,
            detail="Model does not have stock_quantity field",
        )

    current_qty = Decimal(str(item.stock_quantity or 0))
    qty = Decimal(str(payload.quantity))

    if payload.movement_type == "in":
        new_qty = current_qty + qty

    elif payload.movement_type == "out":
        if current_qty < qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Current: {current_qty}, Requested: {qty}",
            )
        new_qty = current_qty - qty

    else:  # adjust
        new_qty = qty

    movement = StockMovement(
        item_type=payload.item_type,
        item_id=payload.item_id,
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        reason=payload.reason,
    )

    try:
        db.add(movement)
        item.stock_quantity = new_qty  # atualiza saldo
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to save stock movement") from None
    db.refresh(movement)
    return movement
