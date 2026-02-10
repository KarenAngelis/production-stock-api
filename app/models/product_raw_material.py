from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship

from app.database import Base


class ProductRawMaterial(Base):
    __tablename__ = "product_raw_materials"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    raw_material_id = Column(Integer, ForeignKey("raw_materials.id"), nullable=False, index=True)

    quantity_required = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="raw_material_links")
    raw_material = relationship("RawMaterial", back_populates="product_links")

    __table_args__ = (
        UniqueConstraint("product_id", "raw_material_id", name="uq_product_raw_material"),
        Index("ix_prm_product_id", "product_id"),
        Index("ix_prm_raw_material_id", "raw_material_id"),
    )
