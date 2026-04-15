from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import get_optional_user
from app.models.job import Job, JobStatus
from app.models.document import Document
from app.models.user import User
from app.services.document_service import retry_job
from app.schemas.job import UpdateResultRequest
from typing import Optional

router = APIRouter()


@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "document_id": job.document_id,
        "status": job.status,
        "progress": job.progress,
        "current_step": job.current_step,
        "error_message": job.error_message,
        "retry_count": job.retry_count,
        "result": job.result,
        "reviewed_result": job.reviewed_result,
        "is_reviewed": job.is_reviewed,
        "is_finalized": job.is_finalized,
        "queued_at": job.queued_at.isoformat(),
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "celery_task_id": job.celery_task_id,
    }


@router.get("/{job_id}/detail")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Return combined document + job detail, keyed by job ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    document = db.query(Document).filter(Document.id == job.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "document": {
            "id": document.id,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "file_type": document.file_type,
            "mime_type": document.mime_type,
            "created_at": document.created_at.isoformat(),
        },
        "job": {
            "id": job.id,
            "status": job.status,
            "progress": job.progress,
            "current_step": job.current_step,
            "error_message": job.error_message,
            "retry_count": job.retry_count,
            "result": job.result,
            "reviewed_result": job.reviewed_result,
            "is_reviewed": job.is_reviewed,
            "is_finalized": job.is_finalized,
            "queued_at": job.queued_at.isoformat(),
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "celery_task_id": job.celery_task_id,
        },
    }


@router.post("/{job_id}/retry")
def retry_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retry a failed or cancelled job by its job ID."""
    updated_job = retry_job(db, job_id, current_user.id if current_user else None)
    return {
        "message": "Job queued for retry",
        "job_id": updated_job.id,
        "retry_count": updated_job.retry_count,
        "celery_task_id": updated_job.celery_task_id,
    }


@router.put("/{job_id}/result")
def update_job_result(
    job_id: int,
    payload: UpdateResultRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Save user-reviewed / edited result for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job must be completed before reviewing")

    job.reviewed_result = payload.reviewed_result
    job.is_reviewed = True
    db.commit()
    return {"message": "Result updated", "job_id": job.id}


@router.post("/{job_id}/finalize")
def finalize_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Finalize a completed job's result — locks it from further editing."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job must be completed to finalize")

    job.is_finalized = True
    job.is_reviewed = True
    if not job.reviewed_result:
        job.reviewed_result = job.result
    db.commit()
    return {"message": "Result finalized", "job_id": job.id}


@router.get("/{job_id}/export")
def export_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Return job export data as JSON (frontend handles CSV serialisation client-side)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job must be completed to export")

    data = job.reviewed_result if job.reviewed_result else job.result
    return {
        "job_id": job.id,
        "document_id": job.document_id,
        "status": job.status,
        "is_finalized": job.is_finalized,
        "result": data,
        "exported_at": __import__("datetime").datetime.utcnow().isoformat(),
    }


@router.delete("/{job_id}/cancel")
def cancel_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Cancel a queued or processing job."""
    from app.workers.celery_app import celery_app
    from app.models.job import JobStatus

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in ("queued", "processing"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {job.status} job")

    if job.celery_task_id:
        celery_app.control.revoke(job.celery_task_id, terminate=True, signal="SIGTERM")

    job.status = JobStatus.CANCELLED
    db.commit()
    return {"message": "Job cancelled", "job_id": job_id}