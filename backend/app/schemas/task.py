from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime

# Schema for task information
class TaskInfo(BaseModel):
    id: str = Field(..., description="Task ID")
    status: str = Field(..., description="Task status (pending, running, completed, failed)")
    created_at: datetime = Field(..., description="When the task was created")
    started_at: Optional[datetime] = Field(None, description="When the task was started")
    completed_at: Optional[datetime] = Field(None, description="When the task was completed")
    result: Optional[Dict[str, Any]] = Field(None, description="Task result")
    error: Optional[str] = Field(None, description="Error message if task failed")

# Schema for task list
class TaskList(BaseModel):
    tasks: List[TaskInfo] = Field(..., description="List of tasks")
    count: int = Field(..., description="Total number of tasks")

# Schema for task creation response
class TaskCreationResponse(BaseModel):
    task_id: str = Field(..., description="Task ID")
    status: str = Field(..., description="Initial task status")

# Schema for task status response
class TaskStatusResponse(BaseModel):
    task_id: str = Field(..., description="Task ID")
    status: str = Field(..., description="Task status")
    result: Optional[Dict[str, Any]] = Field(None, description="Task result if completed")
    error: Optional[str] = Field(None, description="Error message if task failed")
