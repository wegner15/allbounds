import requests
from datetime import datetime
from app.core.config import settings
from app.db.database import SessionLocal
from app.models.email_log import EmailLog

class EmailService:
    def send_email(self, to_email: str, subject: str, html_content: str) -> None:
        """
        Sends an email using Zoho ZeptoMail and logs the outcome to the DB.
        """
        if not settings.ZEPTO_API_KEY:
            print(f"Warning: ZEPTO_API_KEY is missing. Would have sent email to {to_email}")
            return

        url = "https://api.zeptomail.com/v1.1/email"
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": settings.ZEPTO_API_KEY
        }
        
        payload = {
            "from": {"address": "noreply@allboundtravel.com"},
            "to": [{"email_address": {"address": to_email}}],
            "subject": subject,
            "htmlbody": html_content
        }
        
        response_status = None
        response_data = None
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            response_status = response.status_code
            try:
                response_data = response.json()
            except ValueError:
                response_data = {"text": response.text}
        except Exception as e:
            response_status = 500
            response_data = {"error": str(e)}
        
        # Log to database
        db = SessionLocal()
        try:
            log_entry = EmailLog(
                recipient=to_email,
                subject=subject,
                payload=payload,
                response_status=response_status,
                response_data=response_data
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Failed to save email log: {e}")
        finally:
            db.close()

    def generate_html_email(self, title: str, content_html: str, call_to_action: dict = None) -> str:
        """
        Generates a professionally styled HTML email template.
        call_to_action should be a dict with 'url' and 'text'.
        """
        cta_html = ""
        if call_to_action:
            cta_html = f"""
            <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
                <a href="{call_to_action['url']}" style="display: inline-block; padding: 14px 28px; background-color: #008080; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">{call_to_action['text']}</a>
            </div>
            """
            
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #008080; padding: 25px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Allbound Vacations</h1>
                </div>
                
                <div style="padding: 35px 30px; color: #374151; line-height: 1.6; font-size: 15px;">
                    <h2 style="color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f3f4f6;">
                        {title}
                    </h2>
                    
                    {content_html}
                    
                    {cta_html}
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                    &copy; {(datetime.now().year if 'datetime' in globals() else 2026)} Allbound Vacations. All rights reserved.<br>
                    This is an automated notification, please do not reply directly to this email.
                </div>
            </div>
        </body>
        </html>
        """

email_service = EmailService()

