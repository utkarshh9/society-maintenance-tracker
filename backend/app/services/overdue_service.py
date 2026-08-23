from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..core.config import settings
from ..models.complaint import Complaint, ComplaintStatus
from ..models.user import User
from ..services.email_service import email_service

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
    
    @staticmethod
    def send_overdue_reminder(db: Session):
        """Send reminder emails to residents with overdue complaints"""
        complaints = db.query(Complaint).all()
        overdue_complaints = [c for c in complaints if OverdueService.is_overdue(c)]
        
        if not overdue_complaints:
            print("✅ No overdue complaints to remind")
            return
        
        print(f"📧 Sending reminders for {len(overdue_complaints)} overdue complaints")
        
        for complaint in overdue_complaints:
            resident = db.query(User).filter(User.id == complaint.resident_id).first()
            if resident:
                days_overdue = (datetime.now(complaint.created_at.tzinfo) - complaint.created_at).days
                OverdueService.send_overdue_reminder_email(resident, complaint, days_overdue)
        
        print(f"✅ Reminders sent for {len(overdue_complaints)} complaints")
    
    @staticmethod
    def send_overdue_reminder_email(user: User, complaint: Complaint, days_overdue: int):
        """Send a single overdue reminder email to resident"""
        subject = f"⚠️ Complaint #{complaint.id} is Overdue"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .overdue-badge {{
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-weight: 600;
                    background: #DC2626;
                    color: white;
                    font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563EB;
                    color: white;
                    padding: 10px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    margin-top: 16px;
                }}
                .footer {{ text-align: center; color: #6B7280; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">⚠️ Overdue Complaint Alert</h1>
                </div>
                <div class="content">
                    <div style="margin-bottom: 16px;">
                        <span class="overdue-badge">⏰ {days_overdue} Days Overdue</span>
                    </div>
                    
                    <h2>Complaint #{complaint.id} - {complaint.category.value}</h2>
                    <p style="font-size: 16px; line-height: 1.8;">{complaint.description}</p>
                    
                    <div style="background: white; padding: 12px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; font-size: 14px; color: #6B7280;">
                        <p style="margin: 4px 0;"><strong>Status:</strong> {complaint.status.value}</p>
                        <p style="margin: 4px 0;"><strong>Created:</strong> {complaint.created_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p style="margin: 4px 0;"><strong>Priority:</strong> {complaint.priority.value}</p>
                    </div>
                    
                    <p style="color: #DC2626; font-size: 14px;">
                        This complaint has been open for <strong>{days_overdue} days</strong> beyond the allowed 
                        {settings.OVERDUE_THRESHOLD_DAYS} days threshold.
                    </p>
                    
                    <p>
                        <a href="{settings.FRONTEND_URL}/resident/complaints/{complaint.id}" class="button">
                            View Complaint Details
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Society Maintenance Tracker.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        try:
            email_service.send_email(user.email, subject, html)
            print(f"✅ Overdue reminder sent to {user.email} for complaint #{complaint.id}")
        except Exception as e:
            print(f"❌ Failed to send overdue reminder: {e}")

overdue_service = OverdueService()