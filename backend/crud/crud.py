from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import models
from ..schemas import schemas
import uuid

def create_sale(db: Session, sale_data: schemas.SaleCreate):
    # Idempotency check
    existing = db.query(models.Sale).filter(
        models.Sale.station_id == sale_data.station_id,
        models.Sale.external_id == sale_data.external_id
    ).first()
    
    if existing:
        return existing

    # ACID Transaction: Sale + Items + Stock Update
    db_sale = models.Sale(
        id=sale_data.id,
        external_id=sale_data.external_id,
        station_id=sale_data.station_id,
        branch_id=sale_data.branch_id,
        user_id=sale_data.user_id,
        customer_id=sale_data.customer_id,
        total=sale_data.total,
        payment_method=sale_data.payment_method
    )
    db.add(db_sale)
    
    for item in sale_data.items:
        # Row-level lock for stock update
        product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if product:
            product.stock -= item.qty
            sale_item = models.SaleItem(
                sale_id=db_sale.id,
                product_id=item.product_id,
                qty=item.qty,
                unit_price=item.unit_price
            )
            db.add(sale_item)
            
            # Smart Margin/Alert trigger (simplified)
            if product.stock <= product.min_stock:
                # Add to outbox for notification
                notification = models.OutboxMessage(
                    type="WHATSAPP",
                    payload={"msg": f"Stock bajo: {product.name}. Quedan {product.stock}"}
                )
                db.add(notification)

    db.commit()
    db.refresh(db_sale)
    return db_sale

def get_products(db: Session, branch_id: int):
    # RLS logic (simplified in query)
    return db.query(models.Product).filter(models.Product.branch_id == branch_id).all()
