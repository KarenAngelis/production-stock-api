from decimal import Decimal
from typing import List
from pydantic import BaseModel


class ProductionSuggestionItem(BaseModel):
    product_id: int
    product_name: str
    quantity_possible: int
    unit_value: Decimal
    total_value: Decimal


class ProductionSuggestionResponse(BaseModel):
    products: List[ProductionSuggestionItem]
    total_production_value: Decimal
