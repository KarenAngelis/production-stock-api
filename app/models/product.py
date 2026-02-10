from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Numeric(12, 3), nullable=False, default=0)


    raw_material_links = relationship(
        "ProductRawMaterial",
        back_populates="product",
        cascade="all, delete-orphan",
    )
