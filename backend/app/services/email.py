import requests
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

email_service = EmailService()

