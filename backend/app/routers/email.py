from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..dependencies.auth import require_admin
from ..models.user import User, UserRole
from ..services.email_service import email_service

router = APIRouter()

@router.post("/test")
async def send_test_email(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Send a test email to the admin (Admin only)"""
    
    try:
        background_tasks.add_task(
            email_service.send_status_update_email,
            current_user,
            None,  # No complaint
            "This is a test email from Society Maintenance Tracker. Your email configuration is working!"
        )
        return {"message": f"Test email sent to {current_user.email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))