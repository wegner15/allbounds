from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, RoleResponse, PermissionResponse
from app.services.user import user_service, role_service, permission_service
from app.auth.dependencies import get_current_user, get_current_active_superuser, has_permission

router = APIRouter()

# User endpoints
@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_permission("users:read")),
) -> Any:
    """
    Retrieve all users.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(has_permission("users:create")),
) -> Any:
    """
    Create new user.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system",
        )
    user = user_service.create_user(db, user_in)
    return user

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user information.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update current user.
    """
    user = user_service.update_user(db, current_user.id, user_in)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("users:read")),
) -> Any:
    """
    Get a specific user by id.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(has_permission("users:update")),
) -> Any:
    """
    Update a user.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    user = user_service.update_user(db, user_id=user_id, user_in=user_in)
    return user

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(has_permission("users:delete")),
) -> Any:
    """
    Delete a user.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )
    
    user_service.delete_user(db, user_id=user_id)
    return user

# Role management endpoints
@router.get("/roles", response_model=List[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_permission("roles:read")),
) -> Any:
    """
    Retrieve all roles.
    """
    roles = role_service.get_roles(db, skip=skip, limit=limit)
    return roles

# Permission management endpoints
@router.get("/permissions", response_model=List[PermissionResponse])
def get_permissions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_permission("permissions:read")),
) -> Any:
    """
    Retrieve all permissions.
    """
    permissions = permission_service.get_permissions(db, skip=skip, limit=limit)
    return permissions
