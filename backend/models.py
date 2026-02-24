from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    margen_porcentaje = Column(Float)

    productos = relationship("Producto", back_populates="categoria")

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String, index=True, nullable=True)
    descripcion = Column(String, index=True)
    costo_base = Column(Float)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))

    categoria = relationship("Categoria", back_populates="productos")

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    telefono = Column(String, nullable=True)
    saldo_total = Column(Float, default=0.0)

    transacciones = relationship("TransaccionFiado", back_populates="cliente")

class TransaccionFiado(Base):
    __tablename__ = "transacciones_fiados"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    fecha = Column(DateTime, default=datetime.utcnow)
    detalle = Column(String)
    tipo_operacion = Column(String) # 'cargo' or 'abono'
    monto = Column(Float)

    cliente = relationship("Cliente", back_populates="transacciones")

class TrabajoFotocopiadora(Base):
    __tablename__ = "trabajos_fotocopiadora"

    id = Column(Integer, primary_key=True, index=True)
    solicitante = Column(String)
    descripcion_material = Column(String)
    telefono = Column(String, nullable=True)
    estado_actual = Column(String, default="pendiente") # pendiente, listo, entregado

class PedidoLibro(Base):
    __tablename__ = "pedidos_libros"

    id = Column(Integer, primary_key=True, index=True)
    titulo_isbn = Column(String)
    nombre_cliente = Column(String)
    telefono = Column(String)
    monto_senia = Column(Float)
    estado_pedido = Column(String, default="pendiente") # pendiente, en_local, entregado
