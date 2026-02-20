from sqlalchemy import Column, Integer, String, Text, DateTime, func, JSON
from app.db.database import Base

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String, index=True, nullable=False)
    subject = Column(String, nullable=False)
    
    # Store the exact JSON payload sent to Zoho
    payload = Column(JSON, nullable=True)
    
    # Store the integer HTTP status code response
    response_status = Column(Integer, nullable=True)
    
    # Store the exact JSON response body from Zoho
    response_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
