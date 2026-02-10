from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal


class StockMovementBase(BaseModel):
    item_type: Literal["product", "raw_material"]
    item_id: int
    movement_type: Literal["in", "out", "adjust"]
    quantity: Decimal = Field(..., gt=0)
    reason: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementResponse(StockMovementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
