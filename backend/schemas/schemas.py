from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    isbn: Optional[str] = None
    internal_code: Optional[str] = None
    cost: float
    price: float
    stock: float = 0.0
    min_stock: float = 0.0
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    branch_id: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    updated_at: datetime
    class Config:
        from_attributes = True

class SaleItemBase(BaseModel):
    product_id: int
    qty: float
    unit_price: float

class SaleCreate(BaseModel):
    id: str # UUID from frontend
    external_id: int
    station_id: str
    branch_id: int
    user_id: int
    customer_id: Optional[int] = None
    items: List[SaleItemBase]
    total: float
    payment_method: str
