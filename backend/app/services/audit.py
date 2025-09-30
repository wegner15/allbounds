from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User
from typing import Optional

def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLog:
    """
    Create an audit log entry for tracking admin actions.
    """
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log

def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None
):
    """
    Get audit logs with optional filtering.
    """
    query = db.query(AuditLog)

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()