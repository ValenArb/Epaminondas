from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from typing import List
from app.db.database import get_session
from app.models.models import Category, Product
from app.schemas.inventory import CategoryCreate, CategoryRead, ProductCreate, ProductRead
import math

router = APIRouter(prefix="/inventory", tags=["inventory"])

def calculate_price(cost: float, margin: float) -> float:
    # Formula: Precio Final = Costo Base + (Costo Base * (Porcentaje / 100))
    # Redondeo al entero superior como pide el PDF.
    price = cost + (cost * (margin / 100))
    return float(math.ceil(price))

@router.post("/categories", response_model=CategoryRead)
def create_category(category: CategoryCreate, session: Session = Depends(get_session)):
    db_category = Category.model_validate(category)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@router.get("/categories", response_model=List[CategoryRead])
def read_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@router.post("/products", response_model=ProductRead)
def create_product(product: ProductCreate, session: Session = Depends(get_session)):
    db_product = Product.model_validate(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    
    # Calculate price for response
    category = session.get(Category, db_product.categoria_id)
    precio_final = calculate_price(db_product.costo_base, category.margen_porcentaje)
    
    res = ProductRead.model_validate(db_product)
    res.precio_final = precio_final
    return res

@router.get("/products/search", response_model=List[ProductRead])
def search_products(query: str, session: Session = Depends(get_session)):
    # Case-insensitive search on ISBN or description
    statement = select(Product).where(
        or_(
            Product.isbn.ilike(f"%{query}%"),
            Product.descripcion.ilike(f"%{query}%")
        )
    )
    products = session.exec(statement).all()
    
    results = []
    for p in products:
        category = session.get(Category, p.categoria_id)
        precio_final = calculate_price(p.costo_base, category.margen_porcentaje)
        res = ProductRead.model_validate(p)
        res.precio_final = precio_final
        results.append(res)
    
    return results

@router.patch("/products/{product_id}", response_model=ProductRead)
def update_product_cost(product_id: int, costo_base: float, session: Session = Depends(get_session)):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.costo_base = costo_base
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    
    category = session.get(Category, db_product.categoria_id)
    precio_final = calculate_price(db_product.costo_base, category.margen_porcentaje)
    
    res = ProductRead.model_validate(db_product)
    res.precio_final = precio_final
    return res
