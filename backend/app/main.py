from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db

app = FastAPI(title="Epaminondas Kiosk Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to Epaminondas API"}

from app.routers import inventory, ledger, photocopy, orders

app.include_router(inventory.router, prefix="/api/v1")
app.include_router(ledger.router, prefix="/api/v1")
app.include_router(photocopy.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
