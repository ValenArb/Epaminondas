from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# Categorias
class CategoriaBase(BaseModel):
    nombre: str
    margen_porcentaje: float

class CategoriaCreate(CategoriaBase):
    pass

class Categoria(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

# Productos
class ProductoBase(BaseModel):
    isbn: Optional[str] = None
    descripcion: str
    costo_base: float
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    precio_publico: Optional[float] = None # Calculated dynamically

# Clientes
class ClienteBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class Cliente(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    saldo_total: float

# Transacciones
class TransaccionBase(BaseModel):
    detalle: str
    tipo_operacion: str
    monto: float

class TransaccionCreate(TransaccionBase):
    pass

class Transaccion(TransaccionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    cliente_id: int
    fecha: datetime

# Trabajos Fotocopiadora
class TrabajoFotocopiadoraBase(BaseModel):
    solicitante: str
    descripcion_material: str
    telefono: Optional[str] = None
    estado_actual: str = "pendiente"

class TrabajoFotocopiadoraCreate(TrabajoFotocopiadoraBase):
    pass

class TrabajoFotocopiadora(TrabajoFotocopiadoraBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

# Pedido Libros
class PedidoLibroBase(BaseModel):
    titulo_isbn: str
    nombre_cliente: str
    telefono: str
    monto_senia: float
    estado_pedido: str = "pendiente"

class PedidoLibroCreate(PedidoLibroBase):
    pass

class PedidoLibro(PedidoLibroBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
