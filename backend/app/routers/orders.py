from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.models import BookOrder
from app.schemas.orders import BookOrderCreate, BookOrderRead
import urllib.parse

router = APIRouter(prefix="/orders", tags=["orders"])

def generate_wa_url(phone: str, title: str) -> str:
    # URL dinámica: https://wa.me/549[NUMERO_LIMPIO]?text=[MENSAJE_CODIFICADO]
    # Limpiamos el número (asumiendo formato local o internacional simple)
    clean_phone = "".join(filter(str.isdigit, phone))
    if not clean_phone.startswith("549"):
        clean_phone = "549" + clean_phone
        
    msg = f"¡Hola! Te aviso de la librería que ya llegó el libro que encargaste: {title}."
    encoded_msg = urllib.parse.quote(msg)
    return f"https://wa.me/{clean_phone}?text={encoded_msg}"

@router.post("/", response_model=BookOrderRead)
def create_order(order: BookOrderCreate, session: Session = Depends(get_session)):
    db_order = BookOrder.model_validate(order)
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order

@router.get("/", response_model=List[BookOrderRead])
def read_orders(session: Session = Depends(get_session)):
    orders = session.exec(select(BookOrder)).all()
    
    results = []
    for o in orders:
        res = BookOrderRead.model_validate(o)
        if o.estado_pedido == "en_local":
            res.whatsapp_url = generate_wa_url(o.telefono, o.titulo_isbn)
        results.append(res)
    
    return results

@router.patch("/{order_id}/status", response_model=BookOrderRead)
def update_order_status(order_id: int, status: str, session: Session = Depends(get_session)):
    db_order = session.get(BookOrder, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.estado_pedido = status
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    
    res = BookOrderRead.model_validate(db_order)
    if db_order.estado_pedido == "en_local":
        res.whatsapp_url = generate_wa_url(db_order.telefono, db_order.titulo_isbn)
    
    return res
