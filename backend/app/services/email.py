class EmailService:
    def send_email(self, to_email: str, subject: str, html_content: str) -> None:
        """
        Dummy email sender. In a real application, you would integrate
        with an email provider like SendGrid, Mailgun, or SMTP.
        """
        print(f"\n--- Email to {to_email} ---")
        print(f"Subject: {subject}")
        print("Content:")
        print(html_content)
        print("-----------------------------\n")

email_service = EmailService()
