from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# --- Categorias ---
class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    margen_porcentaje: float

    # Relationship
    products: List["Product"] = Relationship(back_populates="category")

# --- Productos ---
class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    isbn: str = Field(index=True)
    descripcion: str = Field(index=True)
    costo_base: float
    categoria_id: int = Field(foreign_key="category.id")

    # Relationship
    category: Optional[Category] = Relationship(back_populates="products")

# --- Clientes ---
class Client(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    telefono: Optional[str] = None
    saldo_total: float = Field(default=0.0)

    # Relationship
    transactions: List["LedgerTransaction"] = Relationship(back_populates="client")

# --- Transacciones_Fiados ---
class LedgerTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="client.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    detalle: str
    tipo_operacion: str # 'cargo' or 'abono'
    monto: float

    # Relationship
    client: Optional[Client] = Relationship(back_populates="transactions")

# --- Trabajos_Fotocopiadora ---
class PhotocopyJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    solicitante: str
    descripcion_material: str
    telefono: Optional[str] = None
    estado_actual: str = Field(default="pendiente") # 'pendiente', 'listo', 'entregado'
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

# --- Pedidos_Libros ---
class BookOrder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo_isbn: str
    nombre_cliente: str
    telefono: str
    monto_senia: float = Field(default=0.0)
    estado_pedido: str = Field(default="pedido") # 'pedido', 'en_local', 'entregado'
    fecha_pedido: datetime = Field(default_factory=datetime.utcnow)
