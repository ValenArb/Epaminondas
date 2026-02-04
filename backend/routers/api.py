from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import crud, customers as crud_customers
from ..schemas import schemas
from ..core.database import get_db
from typing import List

router = APIRouter()

@router.get("/customers/{branch_id}", response_model=List[schemas.Customer])
async def read_customers(branch_id: int, db: Session = Depends(get_db)):
    return crud_customers.get_customers(db, branch_id)

@router.post("/customers", response_model=schemas.Customer)
async def create_new_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud_customers.create_customer(db, customer)

@router.post("/customers/{customer_id}/payments", response_model=schemas.Customer)
async def make_payment(customer_id: int, payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    return crud_customers.add_payment(db, customer_id, payment.amount, payment.user_id)

@router.post("/sales/sync", response_model=List[schemas.SaleCreate])
async def sync_sales(sales: List[schemas.SaleCreate], db: Session = Depends(get_db)):
    synced_sales = []
    for sale in sales:
        try:
            db_sale = crud.create_sale(db, sale)
            synced_sales.append(sale)
        except Exception as e:
            # Log error and continue with next in batch
            print(f"Error syncing sale {sale.id}: {e}")
    return synced_sales

@router.get("/products/{branch_id}", response_model=List[schemas.Product])
async def read_products(branch_id: int, db: Session = Depends(get_db)):
    return crud.get_products(db, branch_id)
