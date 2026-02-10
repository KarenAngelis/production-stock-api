from decimal import Decimal
from typing import List, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.product import Product
from app.models.product_raw_material import ProductRawMaterial
from app.models.raw_material import RawMaterial

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/suggestion")
def production_suggestion(db: Session = Depends(get_db)):
    """
    Suggest which products and quantities can be produced based on available raw materials.
    Priority: higher product value first (greedy strategy).
    """

    products: List[Product] = (
        db.query(Product)
        .order_by(Product.value.desc())
        .all()
    )

    raw_materials: List[RawMaterial] = db.query(RawMaterial).all()

    # IMPORTANT: your RawMaterial uses stock_quantity (per your Swagger)
    # If stock_quantity is Decimal/Numeric, we convert to int for // operations.
    stock: Dict[int, int] = {}
    for rm in raw_materials:
        qty = rm.stock_quantity if rm.stock_quantity is not None else 0
        stock[rm.id] = int(qty)

    relations: List[ProductRawMaterial] = (
        db.query(ProductRawMaterial)
        .options(
            joinedload(ProductRawMaterial.raw_material),
            joinedload(ProductRawMaterial.product),
        )
        .all()
    )

    rel_by_product: Dict[int, List[ProductRawMaterial]] = {}
    for rel in relations:
        rel_by_product.setdefault(rel.product_id, []).append(rel)

    suggested = []
    total_value = Decimal("0.00")

    for p in products:
        bom = rel_by_product.get(p.id)
        if not bom:
            continue

        if any(rel.raw_material is None for rel in bom):
            continue

        max_units = None

        for rel in bom:
            required = int(rel.quantity_required or 0)
            if required <= 0:
                max_units = 0
                break

            available = stock.get(rel.raw_material_id, 0)
            possible = available // required

            max_units = possible if max_units is None else min(max_units, possible)

        if not max_units or max_units <= 0:
            continue

        for rel in bom:
            required = int(rel.quantity_required or 0)
            stock[rel.raw_material_id] -= required * max_units

        unit_value = Decimal(str(p.value))
        product_total = (unit_value * Decimal(max_units)).quantize(Decimal("0.01"))
        total_value += product_total

        suggested.append({
            "product_id": p.id,
            "product_code": p.code,
            "product_name": p.name,
            "unit_value": float(unit_value),
            "quantity_possible": int(max_units),
            "total_value": float(product_total),
        })

    return {
        "products": suggested,
        "total_production_value": float(total_value.quantize(Decimal("0.01"))),
    }
