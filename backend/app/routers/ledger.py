from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.models import Client, LedgerTransaction
from app.schemas.ledger import ClientCreate, ClientRead, TransactionCreate, TransactionRead

router = APIRouter(prefix="/ledger", tags=["ledger"])

@router.post("/clients", response_model=ClientRead)
def create_client(client: ClientCreate, session: Session = Depends(get_session)):
    db_client = Client.model_validate(client)
    session.add(db_client)
    session.commit()
    session.refresh(db_client)
    return db_client

@router.get("/clients", response_model=List[ClientRead])
def read_clients(session: Session = Depends(get_session)):
    return session.exec(select(Client)).all()

@router.post("/clients/{client_id}/transactions", response_model=TransactionRead)
def add_transaction(client_id: int, transaction: TransactionCreate, session: Session = Depends(get_session)):
    db_client = session.get(Client, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_transaction = LedgerTransaction(
        **transaction.model_dump(),
        cliente_id=client_id
    )
    session.add(db_transaction)
    
    # Update client balance
    if transaction.tipo_operacion == 'cargo':
        db_client.saldo_total += transaction.monto
    elif transaction.tipo_operacion == 'abono':
        db_client.saldo_total -= transaction.monto
        
    session.add(db_client)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.get("/clients/{client_id}/history", response_model=List[TransactionRead])
def get_history(client_id: int, session: Session = Depends(get_session)):
    statement = select(LedgerTransaction).where(LedgerTransaction.cliente_id == client_id).order_by(LedgerTransaction.fecha.desc())
    return session.exec(statement).all()
