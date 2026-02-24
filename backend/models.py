from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

# ===== BUSCADOR (Precios) =====

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    margen_porcentaje = Column(Float)
    productos = relationship("Producto", back_populates="categoria", cascade="all, delete-orphan")

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String, index=True, nullable=True)
    descripcion = Column(String, index=True)
    costo_base = Column(Float)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    categoria = relationship("Categoria", back_populates="productos")

# ===== ENCARGOS (Libros) =====

class Grado(Base):
    __tablename__ = "grados"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    libros = relationship("LibroCatalogo", back_populates="grado", cascade="all, delete-orphan")

class LibroCatalogo(Base):
    __tablename__ = "libros_catalogo"
    id = Column(Integer, primary_key=True, index=True)
    grado_id = Column(Integer, ForeignKey("grados.id"))
    titulo = Column(String)
    editorial = Column(String, nullable=True)
    precio = Column(Float, default=0)
    grado = relationship("Grado", back_populates="libros")

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String, index=True)
    telefono = Column(String, nullable=True)
    fecha = Column(String)
    fecha_tentativa = Column(String, nullable=True)
    libros = relationship("LibroPedido", back_populates="pedido", cascade="all, delete-orphan")
    pagos = relationship("PagoPedido", back_populates="pedido", cascade="all, delete-orphan")

class LibroPedido(Base):
    __tablename__ = "libros_pedido"
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    titulo = Column(String)
    isbn = Column(String, nullable=True)
    precio = Column(Float, default=0)
    estado = Column(String, default="faltante")  # faltante, pedido, en_local, entregado
    pedido = relationship("Pedido", back_populates="libros")

class PagoPedido(Base):
    __tablename__ = "pagos_pedido"
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    monto = Column(Float)
    fecha = Column(String)
    nota = Column(String, nullable=True)
    pedido = relationship("Pedido", back_populates="pagos")

class StockLibro(Base):
    __tablename__ = "stock_libros"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    isbn = Column(String, nullable=True)
    tipo = Column(String, default="nuevo")  # nuevo, usado
    cantidad = Column(Integer, default=0)

# ===== FOTOCOPIAS =====

class AnioFotocopia(Base):
    __tablename__ = "anios_fotocopia"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    materiales = relationship("MaterialCatalogo", back_populates="anio", cascade="all, delete-orphan")

class MaterialCatalogo(Base):
    __tablename__ = "materiales_catalogo"
    id = Column(Integer, primary_key=True, index=True)
    anio_id = Column(Integer, ForeignKey("anios_fotocopia.id"))
    titulo = Column(String)
    descripcion = Column(String, nullable=True)
    precio = Column(Float, default=0)
    anio = relationship("AnioFotocopia", back_populates="materiales")

class TrabajoFotocopia(Base):
    __tablename__ = "trabajos_fotocopia"
    id = Column(Integer, primary_key=True, index=True)
    solicitante = Column(String)
    material = Column(String)
    cantidad = Column(Integer, default=1)
    precio = Column(Float, default=0)
    telefono = Column(String, nullable=True)
    estado = Column(String, default="pendiente")  # pendiente, listo, entregado
    fecha = Column(String)
    pagos = relationship("PagoFotocopia", back_populates="trabajo", cascade="all, delete-orphan")

class PagoFotocopia(Base):
    __tablename__ = "pagos_fotocopia"
    id = Column(Integer, primary_key=True, index=True)
    trabajo_id = Column(Integer, ForeignKey("trabajos_fotocopia.id"))
    monto = Column(Float)
    fecha = Column(String)
    nota = Column(String, nullable=True)
    trabajo = relationship("TrabajoFotocopia", back_populates="pagos")

# ===== LIBRETA (Fiados) =====

class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    telefono = Column(String, nullable=True)
    saldo_total = Column(Float, default=0.0)
    transacciones = relationship("TransaccionFiado", back_populates="cliente", cascade="all, delete-orphan")

class TransaccionFiado(Base):
    __tablename__ = "transacciones_fiados"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    fecha = Column(String)
    detalle = Column(String)
    tipo_operacion = Column(String)  # cargo, abono
    monto = Column(Float)
    cliente = relationship("Cliente", back_populates="transacciones")
