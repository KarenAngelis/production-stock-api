from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class RawMaterial(Base):
    __tablename__ = "raw_materials"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)

    stock_quantity = Column(Numeric(12, 3), nullable=False, default=0)

    product_links = relationship(
        "ProductRawMaterial",
        back_populates="raw_material",
        cascade="all, delete-orphan",
    )
