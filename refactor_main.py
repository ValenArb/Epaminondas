import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace endpoint app decorators
content = re.sub(r'@app\.(get|post|put|delete)\("(/categorias|/productos|/grados|/libros|/pedidos|/stock|/anios-fotocopia|/materiales|/trabajos|/clientes|/pagos)', r'@api_router.\1("\2', content)

# Add APIRouter import and auth import
imports = """from fastapi import FastAPI, Depends, HTTPException, APIRouter, status
from fastapi.security import OAuth2PasswordRequestForm
from .auth import get_current_user, create_access_token, get_password_hash, verify_password"""

content = content.replace("from fastapi import FastAPI, Depends, HTTPException", imports)

# Setup APIRouter after app is defined
setup = """
app = FastAPI(title="Panel de Gestión - Kiosco y Librería API")

api_router = APIRouter(dependencies=[Depends(get_current_user)])

@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.on_event("startup")
def create_admin():
    db = next(get_db())
    admin = db.query(models.Usuario).filter(models.Usuario.username == "Admin").first()
    if not admin:
        new_admin = models.Usuario(username="Admin", hashed_password=get_password_hash("Epaminondas01"))
        db.add(new_admin)
        db.commit()
"""
content = content.replace('app = FastAPI(title="Panel de Gestión - Kiosco y Librería API")', setup)

# add api_router to app right before serve_spa
end_setup = """
app.include_router(api_router, prefix="/api")

# Catch-all route for SPA (must be last)"""
content = content.replace('# Catch-all route for SPA (must be last)', end_setup)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(content)
