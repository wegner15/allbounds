from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class EmailLogBase(BaseModel):
    recipient: str
    subject: str

class EmailLogCreate(EmailLogBase):
    payload: Optional[Any] = None
    response_status: Optional[int] = None
    response_data: Optional[Any] = None

class EmailLogResponse(EmailLogBase):
    id: int
    payload: Optional[Any] = None
    response_status: Optional[int] = None
    response_data: Optional[Any] = None
    created_at: datetime

    class Config:
        orm_mode = True
