from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..core.database import get_db
from ..models.user import User, UserRole
from ..models.complaint import Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory
from ..models.complaint_history import ComplaintHistory
from ..schemas.complaint import (
    ComplaintCreate, ComplaintResponse, ComplaintUpdatePriority,
    ComplaintUpdateStatus, ComplaintHistoryResponse
)
from ..dependencies.auth import get_current_user, require_admin
from ..services.email_service import email_service
from ..services.overdue_service import overdue_service

router = APIRouter()

def get_complaint_history(complaint_id: int, db: Session):
    """Helper function to get complaint history with actor names"""
    history = db.query(ComplaintHistory).filter(
        ComplaintHistory.complaint_id == complaint_id
    ).order_by(ComplaintHistory.created_at.desc()).all()
    
    result = []
    for entry in history:
        actor = db.query(User).filter(User.id == entry.actor_id).first()
        result.append(ComplaintHistoryResponse(
            id=entry.id,
            status=entry.status,
            actor_name=actor.name if actor else "Unknown",
            actor_role=actor.role.value if actor else "Unknown",
            note=entry.note,
            created_at=entry.created_at
        ))
    
    return result

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    complaint_data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new complaint (Resident only)"""
    # Create complaint
    new_complaint = Complaint(
        resident_id=current_user.id,
        category=complaint_data.category,
        description=complaint_data.description,
        photo_url=complaint_data.photo_url
    )
    db.add(new_complaint)
    db.flush()
    
    # Create history entry for OPEN status
    history_entry = ComplaintHistory(
        complaint_id=new_complaint.id,
        status=ComplaintStatus.OPEN,
        actor_id=current_user.id,
        note="Complaint created"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(new_complaint)
    
    # Get history
    history = get_complaint_history(new_complaint.id, db)
    
    # Prepare response manually
    response = ComplaintResponse(
        id=new_complaint.id,
        resident_id=new_complaint.resident_id,
        resident_name=current_user.name,
        category=new_complaint.category,
        description=new_complaint.description,
        photo_url=new_complaint.photo_url,
        status=new_complaint.status,
        priority=new_complaint.priority,
        created_at=new_complaint.created_at,
        updated_at=new_complaint.updated_at,
        resolved_at=new_complaint.resolved_at,
        is_overdue=False,
        history=history
    )
    
    return response

@router.get("/", response_model=list[ComplaintResponse])
async def get_complaints(
    status: Optional[ComplaintStatus] = None,
    category: Optional[ComplaintCategory] = None,
    priority: Optional[ComplaintPriority] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complaints - Residents see their own, Admins see all"""
    query = db.query(Complaint)
    
    # Filter by user role
    if current_user.role == UserRole.RESIDENT:
        query = query.filter(Complaint.resident_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if priority:
        query = query.filter(Complaint.priority == priority)
    
    complaints = query.order_by(Complaint.created_at.desc()).all()
    
    # Prepare response with additional data
    result = []
    for complaint in complaints:
        resident = db.query(User).filter(User.id == complaint.resident_id).first()
        history = get_complaint_history(complaint.id, db)
        
        response = ComplaintResponse(
            id=complaint.id,
            resident_id=complaint.resident_id,
            resident_name=resident.name if resident else "Unknown",
            category=complaint.category,
            description=complaint.description,
            photo_url=complaint.photo_url,
            status=complaint.status,
            priority=complaint.priority,
            created_at=complaint.created_at,
            updated_at=complaint.updated_at,
            resolved_at=complaint.resolved_at,
            is_overdue=overdue_service.is_overdue(complaint),
            history=history
        )
        result.append(response)
    
    return result

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific complaint by ID"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check permission
    if current_user.role == UserRole.RESIDENT and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    history = get_complaint_history(complaint_id, db)
    
    response = ComplaintResponse(
        id=complaint.id,
        resident_id=complaint.resident_id,
        resident_name=resident.name if resident else "Unknown",
        category=complaint.category,
        description=complaint.description,
        photo_url=complaint.photo_url,
        status=complaint.status,
        priority=complaint.priority,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
        is_overdue=overdue_service.is_overdue(complaint),
        history=history
    )
    
    return response

@router.patch("/{complaint_id}/priority", response_model=ComplaintResponse)
async def update_priority(
    complaint_id: int,
    priority_data: ComplaintUpdatePriority,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update complaint priority (Admin only)"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.priority = priority_data.priority
    db.commit()
    db.refresh(complaint)
    
    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    history = get_complaint_history(complaint_id, db)
    
    response = ComplaintResponse(
        id=complaint.id,
        resident_id=complaint.resident_id,
        resident_name=resident.name if resident else "Unknown",
        category=complaint.category,
        description=complaint.description,
        photo_url=complaint.photo_url,
        status=complaint.status,
        priority=complaint.priority,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
        is_overdue=overdue_service.is_overdue(complaint),
        history=history
    )
    
    return response

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_status(
    complaint_id: int,
    status_data: ComplaintUpdateStatus,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update complaint status (Admin only) - Records history automatically"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check if complaint is already resolved
    if complaint.status == ComplaintStatus.RESOLVED:
        raise HTTPException(
            status_code=400,
            detail="Cannot update a resolved complaint"
        )
    
    old_status = complaint.status
    complaint.status = status_data.status
    
    # Set resolved_at if resolved
    if status_data.status == ComplaintStatus.RESOLVED:
        complaint.resolved_at = datetime.now()
    
    db.commit()
    db.refresh(complaint)
    
    # Create history entry for this status change
    history_entry = ComplaintHistory(
        complaint_id=complaint.id,
        status=status_data.status,
        actor_id=current_user.id,
        note=status_data.note or f"Status changed from {old_status.value} to {status_data.status.value}"
    )
    db.add(history_entry)
    db.commit()
    
    # Send email notification to resident
    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    if resident:
        email_service.send_status_update_email(
            resident, complaint, status_data.note
        )
    
    history = get_complaint_history(complaint_id, db)
    
    response = ComplaintResponse(
        id=complaint.id,
        resident_id=complaint.resident_id,
        resident_name=resident.name if resident else "Unknown",
        category=complaint.category,
        description=complaint.description,
        photo_url=complaint.photo_url,
        status=complaint.status,
        priority=complaint.priority,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
        is_overdue=overdue_service.is_overdue(complaint),
        history=history
    )
    
    return response

@router.get("/{complaint_id}/history", response_model=list[ComplaintHistoryResponse])
async def get_complaint_history_endpoint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full history of a complaint"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check permission
    if current_user.role == UserRole.RESIDENT and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return get_complaint_history(complaint_id, db)