from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import math

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Panel de Gestión - Kiosco y Librería API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API Kiosco y Librería"}

# ==================== BUSCADOR (Categorías y Productos) ====================

@app.get("/categorias/", response_model=List[schemas.Categoria])
def list_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()

@app.post("/categorias/", response_model=schemas.Categoria)
def create_categoria(cat: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    obj = models.Categoria(**cat.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/categorias/{id}", response_model=schemas.Categoria)
def update_categoria(id: int, cat: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Categoria).get(id)
    if not obj: raise HTTPException(404, "Categoría no encontrada")
    for k, v in cat.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/categorias/{id}")
def delete_categoria(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Categoria).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

def calc_price(costo: float, margen: float) -> float:
    return math.ceil(costo * (1 + margen / 100))

@app.get("/productos/", response_model=List[schemas.Producto])
def list_productos(search: str = "", db: Session = Depends(get_db)):
    q = db.query(models.Producto)
    if search:
        q = q.filter(
            (models.Producto.isbn.ilike(f"%{search}%")) |
            (models.Producto.descripcion.ilike(f"%{search}%"))
        )
    productos = q.all()
    for p in productos:
        if p.categoria:
            p.precio_publico = calc_price(p.costo_base, p.categoria.margen_porcentaje)
        else:
            p.precio_publico = p.costo_base
    return productos

@app.post("/productos/", response_model=schemas.Producto)
def create_producto(prod: schemas.ProductoCreate, db: Session = Depends(get_db)):
    obj = models.Producto(**prod.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    if obj.categoria:
        obj.precio_publico = calc_price(obj.costo_base, obj.categoria.margen_porcentaje)
    return obj

@app.put("/productos/{id}", response_model=schemas.Producto)
def update_producto(id: int, prod: schemas.ProductoCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Producto).get(id)
    if not obj: raise HTTPException(404)
    for k, v in prod.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    if obj.categoria:
        obj.precio_publico = calc_price(obj.costo_base, obj.categoria.margen_porcentaje)
    return obj

@app.delete("/productos/{id}")
def delete_producto(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Producto).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

# ==================== ENCARGOS — Catálogo por Grado ====================

@app.get("/grados/", response_model=List[schemas.Grado])
def list_grados(db: Session = Depends(get_db)):
    return db.query(models.Grado).all()

@app.post("/grados/", response_model=schemas.Grado)
def create_grado(g: schemas.GradoCreate, db: Session = Depends(get_db)):
    obj = models.Grado(**g.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/grados/{id}", response_model=schemas.Grado)
def update_grado(id: int, g: schemas.GradoCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Grado).get(id)
    if not obj: raise HTTPException(404)
    obj.nombre = g.nombre
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/grados/{id}")
def delete_grado(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Grado).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

@app.post("/grados/{grado_id}/libros/", response_model=schemas.LibroCatalogo)
def add_libro_catalogo(grado_id: int, libro: schemas.LibroCatalogoCreate, db: Session = Depends(get_db)):
    grado = db.query(models.Grado).get(grado_id)
    if not grado: raise HTTPException(404)
    obj = models.LibroCatalogo(**libro.model_dump(), grado_id=grado_id)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/libros-catalogo/{id}", response_model=schemas.LibroCatalogo)
def update_libro_catalogo(id: int, libro: schemas.LibroCatalogoCreate, db: Session = Depends(get_db)):
    obj = db.query(models.LibroCatalogo).get(id)
    if not obj: raise HTTPException(404)
    for k, v in libro.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/libros-catalogo/{id}")
def delete_libro_catalogo(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.LibroCatalogo).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

# ==================== ENCARGOS — Pedidos ====================

@app.get("/pedidos/", response_model=List[schemas.Pedido])
def list_pedidos(db: Session = Depends(get_db)):
    return db.query(models.Pedido).all()

@app.post("/pedidos/", response_model=schemas.Pedido)
def create_pedido(p: schemas.PedidoCreate, db: Session = Depends(get_db)):
    pedido = models.Pedido(cliente=p.cliente, telefono=p.telefono, fecha=p.fecha, fecha_tentativa=p.fecha_tentativa)
    db.add(pedido); db.flush()
    for l in p.libros:
        db.add(models.LibroPedido(**l.model_dump(), pedido_id=pedido.id))
        # Ensure 0-stock entry exists for tracking
        existing_stock = db.query(models.StockLibro).filter(
            models.StockLibro.titulo == l.titulo, models.StockLibro.tipo == "nuevo"
        ).first()
        if not existing_stock:
            db.add(models.StockLibro(titulo=l.titulo, isbn=l.isbn, tipo="nuevo", cantidad=0))
    if p.sena > 0:
        db.add(models.PagoPedido(pedido_id=pedido.id, monto=p.sena, fecha=p.fecha, nota="Seña inicial"))
    db.commit(); db.refresh(pedido)
    return pedido

@app.delete("/pedidos/{id}")
def delete_pedido(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Pedido).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

@app.post("/pedidos/{pedido_id}/libros/", response_model=schemas.LibroPedido)
def add_libro_pedido(pedido_id: int, libro: schemas.LibroPedidoCreate, db: Session = Depends(get_db)):
    pedido = db.query(models.Pedido).get(pedido_id)
    if not pedido: raise HTTPException(404)
    obj = models.LibroPedido(**libro.model_dump(), pedido_id=pedido_id)
    db.add(obj)
    # Ensure 0-stock entry exists for tracking
    existing_stock = db.query(models.StockLibro).filter(
        models.StockLibro.titulo == libro.titulo, models.StockLibro.tipo == "nuevo"
    ).first()
    if not existing_stock:
        db.add(models.StockLibro(titulo=libro.titulo, isbn=libro.isbn, tipo="nuevo", cantidad=0))
    db.commit(); db.refresh(obj)
    return obj

@app.put("/libros-pedido/{id}/estado")
def update_libro_estado(id: int, estado: str, db: Session = Depends(get_db)):
    obj = db.query(models.LibroPedido).get(id)
    if not obj: raise HTTPException(404)
    obj.estado = estado
    db.commit(); db.refresh(obj)
    return {"ok": True, "estado": obj.estado}

@app.post("/pedidos/{pedido_id}/pagos/", response_model=schemas.PagoPedido)
def add_pago_pedido(pedido_id: int, pago: schemas.PagoPedidoCreate, db: Session = Depends(get_db)):
    pedido = db.query(models.Pedido).get(pedido_id)
    if not pedido: raise HTTPException(404)
    obj = models.PagoPedido(**pago.model_dump(), pedido_id=pedido_id)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

# ==================== ENCARGOS — Stock ====================

@app.get("/stock/", response_model=List[schemas.StockLibro])
def list_stock(db: Session = Depends(get_db)):
    return db.query(models.StockLibro).all()

@app.post("/stock/", response_model=schemas.StockLibro)
def create_stock(s: schemas.StockLibroCreate, db: Session = Depends(get_db)):
    # Check if title+type combo exists
    existing = db.query(models.StockLibro).filter(
        models.StockLibro.titulo == s.titulo, models.StockLibro.tipo == s.tipo
    ).first()
    if existing:
        existing.cantidad += s.cantidad
        db.commit(); db.refresh(existing)
        return existing
    obj = models.StockLibro(**s.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/stock/{id}", response_model=schemas.StockLibro)
def update_stock(id: int, s: schemas.StockLibroCreate, db: Session = Depends(get_db)):
    obj = db.query(models.StockLibro).get(id)
    if not obj: raise HTTPException(404)
    for k, v in s.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

# ==================== FOTOCOPIAS — Catálogo ====================

@app.get("/anios-fotocopia/", response_model=List[schemas.AnioFotocopia])
def list_anios(db: Session = Depends(get_db)):
    return db.query(models.AnioFotocopia).all()

@app.post("/anios-fotocopia/", response_model=schemas.AnioFotocopia)
def create_anio(a: schemas.AnioFotocopiaCreate, db: Session = Depends(get_db)):
    obj = models.AnioFotocopia(**a.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/anios-fotocopia/{id}", response_model=schemas.AnioFotocopia)
def update_anio(id: int, a: schemas.AnioFotocopiaCreate, db: Session = Depends(get_db)):
    obj = db.query(models.AnioFotocopia).get(id)
    if not obj: raise HTTPException(404)
    obj.nombre = a.nombre
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/anios-fotocopia/{id}")
def delete_anio(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.AnioFotocopia).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

@app.post("/anios-fotocopia/{anio_id}/materiales/", response_model=schemas.MaterialCatalogo)
def add_material(anio_id: int, mat: schemas.MaterialCatalogoCreate, db: Session = Depends(get_db)):
    anio = db.query(models.AnioFotocopia).get(anio_id)
    if not anio: raise HTTPException(404)
    obj = models.MaterialCatalogo(**mat.model_dump(), anio_id=anio_id)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/materiales-catalogo/{id}", response_model=schemas.MaterialCatalogo)
def update_material(id: int, mat: schemas.MaterialCatalogoCreate, db: Session = Depends(get_db)):
    obj = db.query(models.MaterialCatalogo).get(id)
    if not obj: raise HTTPException(404)
    for k, v in mat.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/materiales-catalogo/{id}")
def delete_material(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.MaterialCatalogo).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

# ==================== FOTOCOPIAS — Trabajos ====================

@app.get("/trabajos-fotocopia/", response_model=List[schemas.TrabajoFotocopia])
def list_trabajos(db: Session = Depends(get_db)):
    return db.query(models.TrabajoFotocopia).all()

@app.post("/trabajos-fotocopia/", response_model=schemas.TrabajoFotocopia)
def create_trabajo(t: schemas.TrabajoFotocopiaCreate, db: Session = Depends(get_db)):
    obj = models.TrabajoFotocopia(**t.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/trabajos-fotocopia/{id}/estado")
def update_trabajo_estado(id: int, estado: str, db: Session = Depends(get_db)):
    obj = db.query(models.TrabajoFotocopia).get(id)
    if not obj: raise HTTPException(404)
    obj.estado = estado
    db.commit()
    return {"ok": True}

@app.delete("/trabajos-fotocopia/{id}")
def delete_trabajo(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.TrabajoFotocopia).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

@app.post("/trabajos-fotocopia/{trabajo_id}/pagos/", response_model=schemas.PagoFotocopia)
def add_pago_fotocopia(trabajo_id: int, pago: schemas.PagoFotocopiaCreate, db: Session = Depends(get_db)):
    t = db.query(models.TrabajoFotocopia).get(trabajo_id)
    if not t: raise HTTPException(404)
    obj = models.PagoFotocopia(**pago.model_dump(), trabajo_id=trabajo_id)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

# ==================== LIBRETA (Fiados) ====================

@app.get("/clientes/", response_model=List[schemas.Cliente])
def list_clientes(db: Session = Depends(get_db)):
    return db.query(models.Cliente).all()

@app.post("/clientes/", response_model=schemas.Cliente)
def create_cliente(c: schemas.ClienteCreate, db: Session = Depends(get_db)):
    obj = models.Cliente(**c.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@app.put("/clientes/{id}", response_model=schemas.Cliente)
def update_cliente(id: int, c: schemas.ClienteCreate, db: Session = Depends(get_db)):
    obj = db.query(models.Cliente).get(id)
    if not obj: raise HTTPException(404)
    for k, v in c.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

@app.delete("/clientes/{id}")
def delete_cliente(id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Cliente).get(id)
    if not obj: raise HTTPException(404)
    db.delete(obj); db.commit()
    return {"ok": True}

@app.post("/clientes/{cliente_id}/transacciones/", response_model=schemas.Transaccion)
def add_transaccion(cliente_id: int, t: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    cliente = db.query(models.Cliente).get(cliente_id)
    if not cliente: raise HTTPException(404)
    obj = models.TransaccionFiado(**t.model_dump(), cliente_id=cliente_id)
    db.add(obj)
    if t.tipo_operacion == 'cargo':
        cliente.saldo_total += t.monto
    elif t.tipo_operacion == 'abono':
        cliente.saldo_total -= t.monto
    db.commit(); db.refresh(obj)
    return obj

# ==================== ENCARGOS — Ingresar Stock (asigna a pedidos) ====================

@app.post("/stock/marcar-pedido/")
def marcar_pedido(data: dict, db: Session = Depends(get_db)):
    titulo = data.get("titulo")
    libros_faltantes = db.query(models.LibroPedido).filter(
        models.LibroPedido.titulo == titulo,
        models.LibroPedido.estado == "faltante"
    ).all()
    count = 0
    for lp in libros_faltantes:
        lp.estado = "pedido"
        count += 1
    db.commit()
    return {"ok": True, "count": count}

@app.post("/stock/marcar-local/")
def marcar_local(data: dict, db: Session = Depends(get_db)):
    titulo = data.get("titulo")
    libros_pedidos = db.query(models.LibroPedido).filter(
        models.LibroPedido.titulo == titulo,
        models.LibroPedido.estado.in_(["faltante", "pedido"])
    ).all()
    count = 0
    for lp in libros_pedidos:
        lp.estado = "en_local"
        count += 1
    db.commit()
    return {"ok": True, "count": count}

@app.post("/stock/ingresar/")
def ingresar_stock(data: schemas.StockLibroCreate, db: Session = Depends(get_db)):
    """Ingresar stock y asignar automáticamente a pedidos pendientes (faltante)."""
    cantidad_restante = data.cantidad

    # Find pending book orders matching this title
    libros_faltantes = db.query(models.LibroPedido).filter(
        models.LibroPedido.titulo == data.titulo,
        models.LibroPedido.estado == "faltante"
    ).all()

    asignados = 0
    for lp in libros_faltantes:
        if cantidad_restante <= 0:
            break
        lp.estado = "en_local"
        cantidad_restante -= 1
        asignados += 1

    # Save remaining to stock
    if cantidad_restante > 0:
        existing = db.query(models.StockLibro).filter(
            models.StockLibro.titulo == data.titulo,
            models.StockLibro.tipo == data.tipo
        ).first()
        if existing:
            existing.cantidad += cantidad_restante
        else:
            db.add(models.StockLibro(titulo=data.titulo, tipo=data.tipo, cantidad=cantidad_restante))

    db.commit()
    return {"ok": True, "asignados_a_pedidos": asignados, "al_stock": cantidad_restante}
