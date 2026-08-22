from pydantic import BaseModel
from typing import Optional, List
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
    resident_name: str = ""  # Default empty string
    category: ComplaintCategory
    description: str
    photo_url: Optional[str] = None
    status: ComplaintStatus
    priority: ComplaintPriority
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    is_overdue: bool = False
    history: List[ComplaintHistoryResponse] = []
    
    class Config:
        from_attributes = True