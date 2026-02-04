from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import api
from . import models
from .core.database import engine

# Create tables (In production use Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Epaminondas ERP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Epaminondas ERP API v1 is active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
