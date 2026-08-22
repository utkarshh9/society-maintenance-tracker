import resend
from ..core.config import settings

class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
    
    def send_status_update_email(self, user, complaint, note):
        subject = f"Complaint #{complaint.id} Status Updated"
        html = f"""
        <h2>Hello {user.name},</h2>
        <p>Your complaint <strong>#{complaint.id}</strong> has been updated.</p>
        <p><strong>New Status:</strong> {complaint.status.value}</p>
        <p><strong>Priority:</strong> {complaint.priority.value}</p>
        {f'<p><strong>Note:</strong> {note}</p>' if note else ''}
        <p><a href="{settings.FRONTEND_URL}/resident/complaints/{complaint.id}">View Complaint</a></p>
        <br>
        <p>Regards,<br>Society Maintenance Team</p>
        """
        
        try:
            resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": user.email,
                "subject": subject,
                "html": html
            })
        except Exception as e:
            print(f"Email error: {e}")
    
    def send_important_notice_email(self, user, notice):
        subject = f"🔔 Important Notice: {notice.title}"
        html = f"""
        <h2>Hello {user.name},</h2>
        <h3>📢 {notice.title}</h3>
        <p>{notice.content}</p>
        <p><small>Posted on: {notice.created_at.strftime('%B %d, %Y at %I:%M %p')}</small></p>
        <br>
        <p><a href="{settings.FRONTEND_URL}/resident/notices">View All Notices</a></p>
        <br>
        <p>Regards,<br>Society Maintenance Team</p>
        """
        
        try:
            resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": user.email,
                "subject": subject,
                "html": html
            })
        except Exception as e:
            print(f"Email error: {e}")

email_service = EmailService()