from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# ===== BUSCADOR =====

class CategoriaCreate(BaseModel):
    nombre: str
    margen_porcentaje: float

class Categoria(CategoriaCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int

class ProductoCreate(BaseModel):
    isbn: Optional[str] = None
    descripcion: str
    costo_base: float
    categoria_id: int

class Producto(ProductoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    precio_publico: Optional[float] = None

# ===== ENCARGOS =====

class LibroCatalogoCreate(BaseModel):
    titulo: str
    editorial: Optional[str] = None
    precio: float = 0

class LibroCatalogo(LibroCatalogoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    grado_id: int

class GradoCreate(BaseModel):
    nombre: str

class Grado(GradoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    libros: List[LibroCatalogo] = []

class LibroPedidoCreate(BaseModel):
    titulo: str
    isbn: Optional[str] = None
    precio: float = 0
    estado: str = "faltante"

class LibroPedido(LibroPedidoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pedido_id: int

class PagoPedidoCreate(BaseModel):
    monto: float
    fecha: str
    nota: Optional[str] = None

class PagoPedido(PagoPedidoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pedido_id: int

class PedidoCreate(BaseModel):
    cliente: str
    telefono: Optional[str] = None
    fecha: str
    fecha_tentativa: Optional[str] = None
    archivado: bool = False
    libros: List[LibroPedidoCreate] = []
    sena: float = 0  # initial payment

class Pedido(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    cliente: str
    telefono: Optional[str] = None
    fecha: str
    fecha_tentativa: Optional[str] = None
    archivado: bool = False
    libros: List[LibroPedido] = []
    pagos: List[PagoPedido] = []

class StockLibroCreate(BaseModel):
    titulo: str
    isbn: Optional[str] = None
    tipo: str = "nuevo"
    cantidad: int = 0

class StockLibro(StockLibroCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int

# ===== FOTOCOPIAS =====

class MaterialCatalogoCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    precio: float = 0

class MaterialCatalogo(MaterialCatalogoCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    anio_id: int

class AnioFotocopiaCreate(BaseModel):
    nombre: str

class AnioFotocopia(AnioFotocopiaCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    materiales: List[MaterialCatalogo] = []

class PagoFotocopiaCreate(BaseModel):
    monto: float
    fecha: str
    nota: Optional[str] = None

class PagoFotocopia(PagoFotocopiaCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trabajo_id: int

class TrabajoFotocopiaCreate(BaseModel):
    solicitante: str
    material: str
    cantidad: int = 1
    precio: float = 0
    telefono: Optional[str] = None
    estado: str = "pendiente"
    fecha: str

class TrabajoFotocopia(TrabajoFotocopiaCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pagos: List[PagoFotocopia] = []

# ===== LIBRETA =====

class TransaccionCreate(BaseModel):
    fecha: str
    detalle: str
    tipo_operacion: str
    monto: float

class Transaccion(TransaccionCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    cliente_id: int

class ClienteCreate(BaseModel):
    nombre: str
    telefono: Optional[str] = None

class Cliente(ClienteCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    saldo_total: float
    transacciones: List[Transaccion] = []
