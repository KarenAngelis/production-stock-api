from pydantic import BaseModel
from decimal import Decimal


class ProductBase(BaseModel):
    code: str
    name: str
    value: Decimal


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    model_config = {"from_attributes": True}
