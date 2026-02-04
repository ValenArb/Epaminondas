from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..crud import crud
from ..schemas import schemas
from ..core.database import get_db
from typing import List

router = APIRouter()

@往/sync-sales (POST)
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
