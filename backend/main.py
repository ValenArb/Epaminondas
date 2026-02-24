from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Panel de Gestión para Kiosco y Librería API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API Kiosco y Librería"}

# Categorias
@app.get("/categorias/", response_model=List[schemas.Categoria])
def read_categorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categorias = db.query(models.Categoria).offset(skip).limit(limit).all()
    return categorias

@app.post("/categorias/", response_model=schemas.Categoria)
def create_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    db_categoria = models.Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@app.put("/categorias/{categoria_id}", response_model=schemas.Categoria)
def update_categoria(categoria_id: int, categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    db_categoria = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    
    for key, value in categoria.model_dump().items():
        setattr(db_categoria, key, value)
    
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

# Productos
def calculate_public_price(costo_base: float, margen_porcentaje: float) -> float:
    # Fórmula: Precio Final = Costo Base + (Costo Base * (Porcentaje de la Categoría / 100))
    import math
    precio_final = costo_base + (costo_base * (margen_porcentaje / 100.0))
    # Redondeo al entero superior
    return math.ceil(precio_final)

@app.get("/productos/", response_model=List[schemas.Producto])
def read_productos(search: str = "", skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(models.Producto)
    if search:
        query = query.filter(
            (models.Producto.isbn.ilike(f"%{search}%")) |
            (models.Producto.descripcion.ilike(f"%{search}%"))
        )
    productos = query.offset(skip).limit(limit).all()
    
    # Calculate price dynamically
    for p in productos:
        if p.categoria:
            p.precio_publico = calculate_public_price(p.costo_base, p.categoria.margen_porcentaje)
        else:
            p.precio_publico = p.costo_base
            
    return productos

@app.post("/productos/", response_model=schemas.Producto)
def create_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    if db_producto.categoria:
        db_producto.precio_publico = calculate_public_price(db_producto.costo_base, db_producto.categoria.margen_porcentaje)
    return db_producto

@app.put("/productos/{producto_id}", response_model=schemas.Producto)
def update_producto(producto_id: int, producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in producto.model_dump().items():
        setattr(db_producto, key, value)
    db.commit()
    db.refresh(db_producto)
    return db_producto

# Clientes y Libreta (Fiados)
@app.get("/clientes/", response_model=List[schemas.Cliente])
def read_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Cliente).offset(skip).limit(limit).all()

@app.post("/clientes/", response_model=schemas.Cliente)
def create_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = models.Cliente(**cliente.model_dump())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@app.get("/clientes/{cliente_id}/transacciones", response_model=List[schemas.Transaccion])
def read_transacciones_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return db.query(models.TransaccionFiado).filter(models.TransaccionFiado.cliente_id == cliente_id).order_by(models.TransaccionFiado.fecha.desc()).all()

@app.post("/clientes/{cliente_id}/transacciones", response_model=schemas.Transaccion)
def create_transaccion(cliente_id: int, transaccion: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    db_cliente = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    db_transaccion = models.TransaccionFiado(**transaccion.model_dump(), cliente_id=cliente_id)
    db.add(db_transaccion)
    
    # Update saldo
    if db_transaccion.tipo_operacion == 'cargo':
        db_cliente.saldo_total += db_transaccion.monto
    elif db_transaccion.tipo_operacion == 'abono':
        db_cliente.saldo_total -= db_transaccion.monto
        
    db.commit()
    db.refresh(db_transaccion)
    return db_transaccion

# Fotocopias
@app.get("/fotocopias/", response_model=List[schemas.TrabajoFotocopiadora])
def read_fotocopias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.TrabajoFotocopiadora).offset(skip).limit(limit).all()

@app.post("/fotocopias/", response_model=schemas.TrabajoFotocopiadora)
def create_fotocopia(trabajo: schemas.TrabajoFotocopiadoraCreate, db: Session = Depends(get_db)):
    db_trabajo = models.TrabajoFotocopiadora(**trabajo.model_dump())
    db.add(db_trabajo)
    db.commit()
    db.refresh(db_trabajo)
    return db_trabajo

@app.put("/fotocopias/{trabajo_id}/estado", response_model=schemas.TrabajoFotocopiadora)
def update_fotocopia_estado(trabajo_id: int, nuevo_estado: str, db: Session = Depends(get_db)):
    db_trabajo = db.query(models.TrabajoFotocopiadora).filter(models.TrabajoFotocopiadora.id == trabajo_id).first()
    if not db_trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")
    
    db_trabajo.estado_actual = nuevo_estado
    db.commit()
    db.refresh(db_trabajo)
    return db_trabajo

# Encargos Libros
@app.get("/encargos/", response_model=List[schemas.PedidoLibro])
def read_encargos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.PedidoLibro).offset(skip).limit(limit).all()

@app.post("/encargos/", response_model=schemas.PedidoLibro)
def create_encargo(encargo: schemas.PedidoLibroCreate, db: Session = Depends(get_db)):
    db_encargo = models.PedidoLibro(**encargo.model_dump())
    db.add(db_encargo)
    db.commit()
    db.refresh(db_encargo)
    return db_encargo

@app.put("/encargos/{encargo_id}/estado", response_model=schemas.PedidoLibro)
def update_encargo_estado(encargo_id: int, nuevo_estado: str, db: Session = Depends(get_db)):
    db_encargo = db.query(models.PedidoLibro).filter(models.PedidoLibro.id == encargo_id).first()
    if not db_encargo:
        raise HTTPException(status_code=404, detail="Encargo no encontrado")
    
    db_encargo.estado_pedido = nuevo_estado
    db.commit()
    db.refresh(db_encargo)
    return db_encargo
