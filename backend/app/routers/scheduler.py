from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from ..core.database import get_db
from ..dependencies.auth import require_admin
from ..models.user import User
from ..models.complaint import Complaint
from ..services.overdue_service import overdue_service

router = APIRouter()

@router.post("/run-overdue-check")
async def run_overdue_check(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Manually trigger overdue reminder check (Admin only)"""
    background_tasks.add_task(
        overdue_service.send_overdue_reminder,
        db
    )
    return {"message": "Overdue check started in background"}

@router.get("/overdue-stats")
async def get_overdue_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get overdue complaint statistics (Admin only)"""
    complaints = db.query(Complaint).all()
    overdue_complaints = overdue_service.get_overdue_complaints(complaints)
    
    return {
        "total_complaints": len(complaints),
        "overdue_count": len(overdue_complaints),
        "overdue_percentage": round((len(overdue_complaints) / len(complaints) * 100) if complaints else 0, 2),
        "overdue_complaints": [
            {
                "id": c.id,
                "category": c.category.value,
                "resident_id": c.resident_id,
                "created_at": c.created_at,
                "days_overdue": (datetime.now(c.created_at.tzinfo) - c.created_at).days
            }
            for c in overdue_complaints
        ]
    }