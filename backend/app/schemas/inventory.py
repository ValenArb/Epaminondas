from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    nombre: str
    margen_porcentaje: float

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int

class ProductBase(BaseModel):
    isbn: str
    descripcion: str
    costo_base: float
    categoria_id: int

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    precio_final: float # Calculated field
