import resend
from ..core.config import settings
from ..models.user import User
from ..models.complaint import Complaint
from ..models.notice import Notice

class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        print(f"✅ Email service initialized")
    
    def send_status_update_email(self, user: User, complaint: Complaint, note: str = None):
        """Send email when complaint status changes"""
        subject = f"Complaint #{complaint.id} Status Updated"
        
        status_colors = {
            "OPEN": "#F59E0B",
            "IN_PROGRESS": "#3B82F6",
            "RESOLVED": "#10B981"
        }
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .status-badge {{ 
                    display: inline-block; 
                    padding: 4px 12px; 
                    border-radius: 9999px; 
                    font-weight: 600;
                    background: {status_colors.get(complaint.status.value, '#6B7280')};
                    color: white;
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
                    <h1 style="margin: 0;">🏠 Society Maintenance Tracker</h1>
                </div>
                <div class="content">
                    <h2>Hello {user.name},</h2>
                    <p>Your complaint <strong>#{complaint.id}</strong> has been updated.</p>
                    
                    <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb;">
                        <p style="margin: 4px 0;"><strong>Category:</strong> {complaint.category.value}</p>
                        <p style="margin: 4px 0;"><strong>Status:</strong> <span class="status-badge">{complaint.status.value}</span></p>
                        <p style="margin: 4px 0;"><strong>Priority:</strong> {complaint.priority.value}</p>
                        {f'<p style="margin: 4px 0;"><strong>Note:</strong> {note}</p>' if note else ''}
                    </div>
                    
                    <p>
                        <a href="{settings.FRONTEND_URL}/resident/complaints/{complaint.id}" class="button">
                            View Complaint Details
                        </a>
                    </p>
                    
                    <p style="color: #6B7280; font-size: 14px; margin-top: 16px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <span style="color: #2563EB;">{settings.FRONTEND_URL}/resident/complaints/{complaint.id}</span>
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
            response = resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": user.email,
                "subject": subject,
                "html": html
            })
            print(f"✅ Status update email sent to {user.email}")
            return response
        except Exception as e:
            print(f"❌ Email error: {e}")
            return None
    
    def send_important_notice_email(self, user: User, notice: Notice):
        """Send email when important notice is posted"""
        subject = f"🔔 Important Notice: {notice.title}"

        # Get creator name from database
        from ..core.database import SessionLocal
        db = SessionLocal()
        creator = db.query(User).filter(User.id == notice.created_by).first()
        creator_name = creator.name if creator else "Unknown"
        db.close()

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #D97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .important-badge {{
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-weight: 600;
                    background: #D97706;
                    color: white;
                    font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background: #D97706;
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
                    <h1 style="margin: 0;">📢 Important Notice</h1>
                </div>
                <div class="content">
                    <div style="margin-bottom: 16px;">
                        <span class="important-badge">⚠️ Important</span>
                    </div>

                    <h2>{notice.title}</h2>
                    <p style="font-size: 16px; line-height: 1.8;">{notice.content}</p>

                    <div style="background: white; padding: 12px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; font-size: 14px; color: #6B7280;">
                        <p style="margin: 4px 0;"><strong>Posted by:</strong> {creator_name}</p>
                        <p style="margin: 4px 0;"><strong>Date:</strong> {notice.created_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                    </div>

                    <p>
                        <a href="{settings.FRONTEND_URL}/resident/notices" class="button">
                            View All Notices
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from Society Maintenance Tracker.</p>
                    <p style="margin-top: 4px;">You received this because you're a resident of the society.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            response = resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": user.email,
                "subject": subject,
                "html": html
            })
            print(f"✅ Important notice email sent to {user.email}")
            return response
        except Exception as e:
            print(f"❌ Email error: {e}")
            return None

    def send_email(self, to_email: str, subject: str, html: str):
        """Generic email sender"""
        try:
            response = resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": to_email,
                "subject": subject,
                "html": html
            })
            return response
        except Exception as e:
            print(f"❌ Email error: {e}")
            return None

email_service = EmailService()