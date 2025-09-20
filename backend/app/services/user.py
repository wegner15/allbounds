from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session

from app.models.user import User, Role, Permission
from app.schemas.user import UserCreate, UserUpdate
from app.auth.security import get_password_hash

class UserService:
    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Retrieve all users with pagination.
        """
        return db.query(User).offset(skip).limit(limit).all()
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """
        Retrieve a specific user by ID.
        """
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Retrieve a specific user by email.
        """
        return db.query(User).filter(User.email == email).first()
    
    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Create a new user.
        """
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            is_active=user_in.is_active,
            is_superuser=user_in.is_superuser,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_user(self, db: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
        """
        Update an existing user.
        """
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_in.model_dump(exclude_unset=True)
        
        # Hash the password if it's being updated
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """
        Delete a user.
        """
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        return True
    
    def assign_role_to_user(self, db: Session, user_id: int, role_id: int) -> Optional[User]:
        """
        Assign a role to a user.
        """
        db_user = self.get_user(db, user_id)
        db_role = db.query(Role).filter(Role.id == role_id).first()
        
        if not db_user or not db_role:
            return None
        
        db_user.roles.append(db_role)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def remove_role_from_user(self, db: Session, user_id: int, role_id: int) -> Optional[User]:
        """
        Remove a role from a user.
        """
        db_user = self.get_user(db, user_id)
        db_role = db.query(Role).filter(Role.id == role_id).first()
        
        if not db_user or not db_role:
            return None
        
        if db_role in db_user.roles:
            db_user.roles.remove(db_role)
            db.commit()
            db.refresh(db_user)
        
        return db_user

class RoleService:
    def get_roles(self, db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
        """
        Retrieve all roles with pagination.
        """
        return db.query(Role).offset(skip).limit(limit).all()
    
    def get_role(self, db: Session, role_id: int) -> Optional[Role]:
        """
        Retrieve a specific role by ID.
        """
        return db.query(Role).filter(Role.id == role_id).first()
    
    def get_role_by_name(self, db: Session, name: str) -> Optional[Role]:
        """
        Retrieve a specific role by name.
        """
        return db.query(Role).filter(Role.name == name).first()
    
    def create_role(self, db: Session, name: str, description: Optional[str] = None) -> Role:
        """
        Create a new role.
        """
        db_role = Role(name=name, description=description)
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role
    
    def update_role(self, db: Session, role_id: int, name: Optional[str] = None, description: Optional[str] = None) -> Optional[Role]:
        """
        Update an existing role.
        """
        db_role = self.get_role(db, role_id)
        if not db_role:
            return None
        
        if name is not None:
            db_role.name = name
        if description is not None:
            db_role.description = description
        
        db.commit()
        db.refresh(db_role)
        return db_role
    
    def delete_role(self, db: Session, role_id: int) -> bool:
        """
        Delete a role.
        """
        db_role = self.get_role(db, role_id)
        if not db_role:
            return False
        
        db.delete(db_role)
        db.commit()
        return True
    
    def assign_permission_to_role(self, db: Session, role_id: int, permission_id: int) -> Optional[Role]:
        """
        Assign a permission to a role.
        """
        db_role = self.get_role(db, role_id)
        db_permission = db.query(Permission).filter(Permission.id == permission_id).first()
        
        if not db_role or not db_permission:
            return None
        
        db_role.permissions.append(db_permission)
        db.commit()
        db.refresh(db_role)
        return db_role
    
    def remove_permission_from_role(self, db: Session, role_id: int, permission_id: int) -> Optional[Role]:
        """
        Remove a permission from a role.
        """
        db_role = self.get_role(db, role_id)
        db_permission = db.query(Permission).filter(Permission.id == permission_id).first()
        
        if not db_role or not db_permission:
            return None
        
        if db_permission in db_role.permissions:
            db_role.permissions.remove(db_permission)
            db.commit()
            db.refresh(db_role)
        
        return db_role

class PermissionService:
    def get_permissions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Permission]:
        """
        Retrieve all permissions with pagination.
        """
        return db.query(Permission).offset(skip).limit(limit).all()
    
    def get_permission(self, db: Session, permission_id: int) -> Optional[Permission]:
        """
        Retrieve a specific permission by ID.
        """
        return db.query(Permission).filter(Permission.id == permission_id).first()
    
    def get_permission_by_name(self, db: Session, name: str) -> Optional[Permission]:
        """
        Retrieve a specific permission by name.
        """
        return db.query(Permission).filter(Permission.name == name).first()
    
    def create_permission(self, db: Session, name: str, description: Optional[str] = None) -> Permission:
        """
        Create a new permission.
        """
        db_permission = Permission(name=name, description=description)
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
    
    def update_permission(self, db: Session, permission_id: int, name: Optional[str] = None, description: Optional[str] = None) -> Optional[Permission]:
        """
        Update an existing permission.
        """
        db_permission = self.get_permission(db, permission_id)
        if not db_permission:
            return None
        
        if name is not None:
            db_permission.name = name
        if description is not None:
            db_permission.description = description
        
        db.commit()
        db.refresh(db_permission)
        return db_permission
    
    def delete_permission(self, db: Session, permission_id: int) -> bool:
        """
        Delete a permission.
        """
        db_permission = self.get_permission(db, permission_id)
        if not db_permission:
            return False
        
        db.delete(db_permission)
        db.commit()
        return True

user_service = UserService()
role_service = RoleService()
permission_service = PermissionService()
