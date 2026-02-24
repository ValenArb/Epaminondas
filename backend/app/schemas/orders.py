from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookOrderBase(BaseModel):
    titulo_isbn: str
    nombre_cliente: str
    telefono: str
    monto_senia: float = 0.0

class BookOrderCreate(BookOrderBase):
    pass

class BookOrderRead(BookOrderBase):
    id: int
    estado_pedido: str
    fecha_pedido: datetime
    whatsapp_url: Optional[str] = None
