from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.task import TaskInfo, TaskList, TaskCreationResponse, TaskStatusResponse
from app.tasks.task_manager import task_manager
from app.tasks.search_tasks import index_all_entities, index_entity
from app.tasks.media_tasks import process_uploaded_media, download_and_upload_external_media
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=TaskList)
async def get_tasks(
    status_filter: str = None,
    current_user: User = Depends(has_permission("tasks:read")),
) -> Any:
    """
    Get all tasks, optionally filtered by status.
    """
    tasks = task_manager.get_tasks(status_filter)
    return {
        "tasks": tasks,
        "count": len(tasks)
    }

@router.get("/{task_id}", response_model=TaskInfo)
async def get_task(
    task_id: str,
    current_user: User = Depends(has_permission("tasks:read")),
) -> Any:
    """
    Get task information.
    """
    task = task_manager.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.post("/index-all", response_model=TaskCreationResponse)
async def start_index_all_task(
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Start a task to index all entities.
    """
    task_id = await task_manager.add_task(index_all_entities, db)
    return {
        "task_id": task_id,
        "status": "pending"
    }

@router.post("/index-entity", response_model=TaskCreationResponse)
async def start_index_entity_task(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Start a task to index a specific entity.
    """
    task_id = await task_manager.add_task(index_entity, db, entity_type, entity_id)
    return {
        "task_id": task_id,
        "status": "pending"
    }

@router.post("/process-media", response_model=TaskCreationResponse)
async def start_process_media_task(
    storage_key: str,
    filename: str,
    size_bytes: int,
    mime_type: str,
    entity_type: str = None,
    entity_id: int = None,
    alt_text: str = None,
    title: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("media:create")),
) -> Any:
    """
    Start a task to process an uploaded media file.
    """
    task_id = await task_manager.add_task(
        process_uploaded_media, db, storage_key, filename, size_bytes, mime_type,
        entity_type, entity_id, alt_text, title
    )
    return {
        "task_id": task_id,
        "status": "pending"
    }

@router.post("/download-media", response_model=TaskCreationResponse)
async def start_download_media_task(
    external_url: str,
    entity_type: str = None,
    entity_id: int = None,
    alt_text: str = None,
    title: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("media:create")),
) -> Any:
    """
    Start a task to download a media file from an external URL and upload it to R2.
    """
    task_id = await task_manager.add_task(
        download_and_upload_external_media, db, external_url,
        entity_type, entity_id, alt_text, title
    )
    return {
        "task_id": task_id,
        "status": "pending"
    }

@router.delete("/clear-completed", response_model=dict)
async def clear_completed_tasks(
    current_user: User = Depends(has_permission("tasks:admin")),
) -> Any:
    """
    Clear completed tasks.
    """
    count = task_manager.clear_completed_tasks()
    return {
        "cleared_count": count,
        "message": f"Cleared {count} completed tasks"
    }
