from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.user import User, UserRole
from ..models.notice import Notice
from ..schemas.notice import NoticeCreate, NoticeResponse
from ..dependencies.auth import get_current_user, require_admin
from ..services.email_service import email_service

router = APIRouter()

@router.get("/", response_model=list[NoticeResponse])
async def get_notices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notices - Important ones first"""
    notices = db.query(Notice).order_by(
        Notice.is_important.desc(),
        Notice.created_at.desc()
    ).all()
    
    result = []
    for notice in notices:
        creator = db.query(User).filter(User.id == notice.created_by).first()
        result.append(NoticeResponse(
            id=notice.id,
            title=notice.title,
            content=notice.content,
            is_important=notice.is_important,
            created_by=notice.created_by,
            creator_name=creator.name if creator else "Unknown",
            created_at=notice.created_at
        ))
    
    return result

@router.post("/", response_model=NoticeResponse)
async def create_notice(
    notice_data: NoticeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()  # ✅ Added BackgroundTasks
):
    """Create a new notice (Admin only)"""
    new_notice = Notice(
        title=notice_data.title,
        content=notice_data.content,
        is_important=notice_data.is_important,
        created_by=current_user.id
    )
    
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    
    # 📧 Send email if important (in background)
    if notice_data.is_important:
        residents = db.query(User).filter(User.role == UserRole.RESIDENT).all()
        for resident in residents:
            background_tasks.add_task(
                email_service.send_important_notice_email,
                resident,
                new_notice
            )
    
    return NoticeResponse(
        id=new_notice.id,
        title=new_notice.title,
        content=new_notice.content,
        is_important=new_notice.is_important,
        created_by=new_notice.created_by,
        creator_name=current_user.name,
        created_at=new_notice.created_at
    )

@router.delete("/{notice_id}")
async def delete_notice(
    notice_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a notice (Admin only)"""
    notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    db.delete(notice)
    db.commit()
    
    return {"message": "Notice deleted successfully"}