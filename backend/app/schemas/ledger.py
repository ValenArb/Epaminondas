from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TransactionBase(BaseModel):
    detalle: str
    tipo_operacion: str
    monto: float

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    cliente_id: int
    fecha: datetime

class ClientBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientRead(ClientBase):
    id: int
    saldo_total: float
