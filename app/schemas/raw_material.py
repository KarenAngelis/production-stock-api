from pydantic import BaseModel


class RawMaterialBase(BaseModel):
    code: str
    name: str
    stock_quantity: int


class RawMaterialCreate(RawMaterialBase):
    pass


class RawMaterialResponse(RawMaterialBase):
    id: int
    model_config = {"from_attributes": True}
