from typing import Any, List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.client_service import client_service
from app.schemas.client import (
    ClientResponse,
    ClientCreate,
    ClientUpdate,
    ClientStatementResponse,
)

router = APIRouter()


@router.get("", response_model=Dict[str, Any] if False else Any)
def get_clients(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    client_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List clients with pagination, spend/balance calculations, and search."""
    items, total = client_service.get_clients(
        db, skip=skip, limit=limit, search=search, client_type=client_type, is_active=is_active
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("", response_model=ClientResponse)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new client (individual or corporate)."""
    try:
        return client_service.create_client(db, client_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get full client profile with financial summary."""
    client = client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update client details."""
    try:
        client = client_service.update_client(db, client_id, client_update)
        if not client:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
        return client
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete or deactivate a client."""
    success = client_service.delete_client(db, client_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return {"message": "Client deleted or archived successfully"}


@router.get("/{client_id}/statement", response_model=ClientStatementResponse)
def get_client_statement(
    client_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate chronological Statement of Account for a client."""
    statement = client_service.get_client_statement(
        db, client_id=client_id, start_date=start_date, end_date=end_date
    )
    if not statement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return statement
