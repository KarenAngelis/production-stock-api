from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)

    # "product" ou "raw_material"
    item_type = Column(String, nullable=False)

    # id do produto OU id da matéria-prima
    item_id = Column(Integer, nullable=False)

    # "in", "out", "adjust"
    movement_type = Column(String, nullable=False)

    # quantidade (use positivo sempre; o tipo define se entra/sai)
    quantity = Column(Numeric(12, 3), nullable=False)

    # motivo (ex: "compra", "venda", "produção", "inventário")
    reason = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
