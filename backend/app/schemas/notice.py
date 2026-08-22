from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NoticeCreate(BaseModel):
    title: str
    content: str
    is_important: bool = False

class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    is_important: bool
    created_by: int
    creator_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True