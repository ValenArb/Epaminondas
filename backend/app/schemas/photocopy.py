from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PhotocopyBase(BaseModel):
    solicitante: str
    descripcion_material: str
    telefono: Optional[str] = None

class PhotocopyCreate(PhotocopyBase):
    pass

class PhotocopyRead(PhotocopyBase):
    id: int
    estado_actual: str
    fecha_creacion: datetime
