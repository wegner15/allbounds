"""
SQLAlchemy session utilities for memory management.
"""

from typing import Any, List
from sqlalchemy.orm import Session


def detach_and_serialize(db: Session, obj: Any) -> Any:
    """
    Detach an object from the session to prevent lazy-loading after response.
    
    This prevents memory leaks by ensuring no lazy-loads happen during
    Pydantic serialization after the session is closed.
    
    Args:
        db: SQLAlchemy session
        obj: ORM object or list of ORM objects
        
    Returns:
        The same object(s), detached from session
    """
    if obj is None:
        return None
    
    if isinstance(obj, list):
        # Detach all objects in list
        for item in obj:
            if item is not None:
                db.expunge(item)
        return obj
    else:
        # Detach single object
        db.expunge(obj)
        return obj


def eager_load_for_serialization(obj: Any, *relationships: str) -> Any:
    """
    Force-load specific relationships before serialization.
    
    Use this when you need to access relationships after the session closes.
    
    Example:
        package = db.query(Package).first()
        eager_load_for_serialization(package, 'country', 'holiday_types')
        # Now package.country and package.holiday_types are loaded
    
    Args:
        obj: ORM object
        *relationships: Names of relationships to load
        
    Returns:
        The same object with relationships loaded
    """
    if obj is None:
        return None
    
    for rel_name in relationships:
        # Access the relationship to trigger lazy-load while session is still open
        getattr(obj, rel_name, None)
    
    return obj
