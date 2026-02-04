from sqlalchemy.orm import Session
from .. import models
from ..schemas import schemas
from datetime import datetime

def create_customer(db: Session, customer_data: schemas.CustomerCreate):
    db_customer = models.Customer(**customer_data.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customers(db: Session, branch_id: int):
    return db.query(models.Customer).filter(models.Customer.branch_id == branch_id).all()

def add_payment(db: Session, customer_id: int, amount: float, user_id: int):
    # Atomic balance update
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).with_for_update().first()
    if not customer:
        return None
    
    old_balance = customer.current_balance
    customer.current_balance -= amount
    
    # Log movement
    audit = models.AuditLog(
        user_id=user_id,
        action="CUSTOMER_PAYMENT",
        payload={
            "customer_id": customer_id,
            "amount": amount,
            "old_balance": old_balance,
            "new_balance": customer.current_balance
        }
    )
    db.add(audit)
    db.commit()
    return customer
