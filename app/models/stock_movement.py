from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)

    item_type = Column(String, nullable=False)

    item_id = Column(Integer, nullable=False)

    movement_type = Column(String, nullable=False)

    quantity = Column(Numeric(12, 3), nullable=False)

    reason = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
