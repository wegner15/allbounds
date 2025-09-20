from typing import Optional, List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User, Role, Permission
from app.schemas.token import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get the current user from the JWT token.
    
    Args:
        db: Database session
        token: JWT token
        
    Returns:
        The current user
        
    Raises:
        HTTPException: If the token is invalid or the user doesn't exist
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        if token_data.type != "access":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if not user:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    
    return user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current user and verify that they are a superuser.
    
    Args:
        current_user: The current user
        
    Returns:
        The current superuser
        
    Raises:
        HTTPException: If the user is not a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user

def has_permission(required_permission: str):
    """
    Dependency factory to check if the current user has a specific permission.
    
    Args:
        required_permission: The permission to check for
        
    Returns:
        A dependency function that checks for the permission
    """
    async def check_permission(
        db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
    ) -> User:
        # Superusers have all permissions
        if current_user.is_superuser:
            return current_user
        
        # Check if the user has the required permission through their roles
        user_permissions = set()
        for role in current_user.roles:
            for permission in role.permissions:
                user_permissions.add(permission.name)
        
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {required_permission} is required",
            )
        
        return current_user
    
    return check_permission

def has_role(required_role: str):
    """
    Dependency factory to check if the current user has a specific role.
    
    Args:
        required_role: The role to check for
        
    Returns:
        A dependency function that checks for the role
    """
    async def check_role(
        db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
    ) -> User:
        # Superusers have all roles
        if current_user.is_superuser:
            return current_user
        
        # Check if the user has the required role
        user_roles = {role.name for role in current_user.roles}
        
        if required_role not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role denied: {required_role} is required",
            )
        
        return current_user
    
    return check_role
