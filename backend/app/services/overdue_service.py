from datetime import datetime, timedelta
from ..core.config import settings
from ..models.complaint import Complaint, ComplaintStatus

class OverdueService:
    @staticmethod
    def is_overdue(complaint):
        if complaint.status == ComplaintStatus.RESOLVED:
            return False
        
        threshold = timedelta(days=settings.OVERDUE_THRESHOLD_DAYS)
        overdue_date = complaint.created_at + threshold
        return datetime.now(complaint.created_at.tzinfo) > overdue_date
    
    @staticmethod
    def get_overdue_complaints(complaints):
        return [c for c in complaints if OverdueService.is_overdue(c)]

overdue_service = OverdueService()