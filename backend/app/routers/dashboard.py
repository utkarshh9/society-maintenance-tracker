from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from ..core.database import get_db
from ..models.user import User
from ..models.complaint import Complaint, ComplaintStatus, ComplaintCategory
from ..dependencies.auth import require_admin
from ..schemas.dashboard import DashboardStats
from ..services.overdue_service import overdue_service

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics (Admin only)"""
    
    # Total complaints
    total = db.query(Complaint).count()
    
    # By status
    by_status = {}
    for status in ComplaintStatus:
        count = db.query(Complaint).filter(Complaint.status == status).count()
        by_status[status.value.lower()] = count
    
    # By category
    by_category = {}
    for category in ComplaintCategory:
        count = db.query(Complaint).filter(Complaint.category == category).count()
        by_category[category.value.lower()] = count
    
    # Overdue count
    complaints = db.query(Complaint).all()
    overdue = sum(1 for c in complaints if overdue_service.is_overdue(c))
    
    return DashboardStats(
        total=total,
        by_status=by_status,
        by_category=by_category,
        overdue=overdue
    )

@router.get("/overdue")
async def get_overdue_complaints(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all overdue complaints (Admin only)"""
    complaints = db.query(Complaint).all()
    overdue = [c for c in complaints if overdue_service.is_overdue(c)]
    
    # Convert to response format
    result = []
    for complaint in overdue:
        resident = db.query(User).filter(User.id == complaint.resident_id).first()
        # Calculate days overdue
        days_overdue = (datetime.now(complaint.created_at.tzinfo) - complaint.created_at).days
        result.append({
            "id": complaint.id,
            "category": complaint.category.value,
            "description": complaint.description,
            "status": complaint.status.value,
            "priority": complaint.priority.value,
            "resident_name": resident.name if resident else "Unknown",
            "created_at": complaint.created_at,
            "days_overdue": days_overdue
        })
    
    return result