from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base
import enum

class UserRole(str, enum.Enum):
    RESIDENT = "resident"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RESIDENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    complaints = relationship("Complaint", back_populates="resident", foreign_keys="Complaint.resident_id")
    history_entries = relationship("ComplaintHistory", back_populates="actor")
    notices = relationship("Notice", back_populates="creator")