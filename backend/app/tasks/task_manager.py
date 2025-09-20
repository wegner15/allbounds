import logging
import asyncio
from typing import Dict, Any, Callable, Awaitable, List, Optional
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class TaskManager:
    """
    Task manager for handling background tasks.
    """
    
    def __init__(self):
        """
        Initialize the task manager.
        """
        self.tasks: Dict[str, Dict[str, Any]] = {}
    
    async def add_task(self, func: Callable[..., Awaitable[Any]], *args, **kwargs) -> str:
        """
        Add a task to the task manager.
        
        Args:
            func: Async function to execute
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Task ID
        """
        task_id = str(uuid.uuid4())
        
        # Create task info
        task_info = {
            "id": task_id,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "started_at": None,
            "completed_at": None,
            "result": None,
            "error": None
        }
        
        # Store task info
        self.tasks[task_id] = task_info
        
        # Create and start the task
        asyncio.create_task(self._run_task(task_id, func, *args, **kwargs))
        
        return task_id
    
    async def _run_task(self, task_id: str, func: Callable[..., Awaitable[Any]], *args, **kwargs) -> None:
        """
        Run a task and update its status.
        
        Args:
            task_id: Task ID
            func: Async function to execute
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
        """
        task_info = self.tasks[task_id]
        task_info["status"] = "running"
        task_info["started_at"] = datetime.utcnow()
        
        try:
            result = await func(*args, **kwargs)
            task_info["status"] = "completed"
            task_info["result"] = result
        except Exception as e:
            logger.exception(f"Error running task {task_id}: {e}")
            task_info["status"] = "failed"
            task_info["error"] = str(e)
        finally:
            task_info["completed_at"] = datetime.utcnow()
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get task information.
        
        Args:
            task_id: Task ID
            
        Returns:
            Task information or None if not found
        """
        return self.tasks.get(task_id)
    
    def get_tasks(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all tasks, optionally filtered by status.
        
        Args:
            status: Optional status filter
            
        Returns:
            List of task information
        """
        if status:
            return [task for task in self.tasks.values() if task["status"] == status]
        return list(self.tasks.values())
    
    def clear_completed_tasks(self) -> int:
        """
        Clear completed tasks.
        
        Returns:
            Number of tasks cleared
        """
        completed_task_ids = [
            task_id for task_id, task in self.tasks.items()
            if task["status"] in ["completed", "failed"]
        ]
        
        for task_id in completed_task_ids:
            del self.tasks[task_id]
        
        return len(completed_task_ids)

# Create a singleton instance
task_manager = TaskManager()
