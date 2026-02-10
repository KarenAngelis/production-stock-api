from pydantic import BaseModel


class ProductRawMaterialCreate(BaseModel):
    product_id: int
    raw_material_id: int
    quantity_required: int


class ProductRawMaterialResponse(ProductRawMaterialCreate):
    id: int

    class Config:
        from_attributes = True
