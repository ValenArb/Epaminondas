from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.models import PhotocopyJob
from app.schemas.photocopy import PhotocopyCreate, PhotocopyRead

router = APIRouter(prefix="/photocopies", tags=["photocopy"])

@router.post("/", response_model=PhotocopyRead)
def create_job(job: PhotocopyCreate, session: Session = Depends(get_session)):
    db_job = PhotocopyJob.model_validate(job)
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job

@router.get("/", response_model=List[PhotocopyRead])
def read_jobs(session: Session = Depends(get_session)):
    return session.exec(select(PhotocopyJob)).all()

@router.patch("/{job_id}/status", response_model=PhotocopyRead)
def update_job_status(job_id: int, status: str, session: Session = Depends(get_session)):
    db_job = session.get(PhotocopyJob, job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if status not in ["pendiente", "listo", "entregado"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    db_job.estado_actual = status
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job
