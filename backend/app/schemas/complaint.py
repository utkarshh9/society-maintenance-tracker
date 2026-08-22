from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.complaint import ComplaintStatus, ComplaintPriority, ComplaintCategory

class ComplaintCreate(BaseModel):
    category: ComplaintCategory
    description: str
    photo_url: Optional[str] = None

class ComplaintUpdatePriority(BaseModel):
    priority: ComplaintPriority

class ComplaintUpdateStatus(BaseModel):
    status: ComplaintStatus
    note: Optional[str] = None

class ComplaintHistoryResponse(BaseModel):
    id: int
    status: ComplaintStatus
    actor_name: str
    actor_role: str
    note: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: int
    resident_id: int
    resident_name: str
    category: ComplaintCategory
    description: str
    photo_url: Optional[str]
    status: ComplaintStatus
    priority: ComplaintPriority
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]
    is_overdue: bool = False
    history: Optional[list[ComplaintHistoryResponse]] = []
    
    class Config:
        from_attributes = True