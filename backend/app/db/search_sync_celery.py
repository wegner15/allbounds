"""
Database event listeners for automatic Meilisearch synchronization using Celery.

This module sets up SQLAlchemy event listeners that queue Celery tasks
for Meilisearch synchronization, avoiding blocking database transactions.
"""

import logging
from sqlalchemy import event

logger = logging.getLogger("app.search_sync")


def sync_to_meilisearch_after_insert(mapper, connection, target):
    """
    Queue Celery task to sync entity to Meilisearch after insert.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was inserted
    """
    from app.tasks.search_tasks import sync_entity_to_meilisearch
    
    entity_type = target.__class__.__name__
    entity_id = target.id
    
    try:
        # Only sync if entity is active
        if hasattr(target, 'is_active') and not target.is_active:
            logger.debug(f"Skipping Meilisearch sync for inactive {entity_type} (id={entity_id})")
            return
        
        # Queue Celery task (non-blocking)
        sync_entity_to_meilisearch.delay(entity_type, entity_id, 'insert')
        logger.debug(f"Queued Meilisearch sync for {entity_type} (id={entity_id})")
        
    except Exception as e:
        logger.error(f"Error queuing Meilisearch sync for {entity_type} (id={entity_id}): {e}")


def sync_to_meilisearch_after_update(mapper, connection, target):
    """
    Queue Celery task to sync entity to Meilisearch after update.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was updated
    """
    from app.tasks.search_tasks import sync_entity_to_meilisearch
    
    entity_type = target.__class__.__name__
    entity_id = target.id
    
    try:
        # Queue Celery task (non-blocking)
        sync_entity_to_meilisearch.delay(entity_type, entity_id, 'update')
        logger.debug(f"Queued Meilisearch sync for {entity_type} (id={entity_id})")
        
    except Exception as e:
        logger.error(f"Error queuing Meilisearch sync for {entity_type} (id={entity_id}): {e}")


def sync_to_meilisearch_after_delete(mapper, connection, target):
    """
    Queue Celery task to remove entity from Meilisearch after delete.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was deleted
    """
    from app.tasks.search_tasks import sync_entity_to_meilisearch
    
    entity_type = target.__class__.__name__
    entity_id = target.id
    
    try:
        # Queue Celery task (non-blocking)
        sync_entity_to_meilisearch.delay(entity_type, entity_id, 'delete')
        logger.debug(f"Queued Meilisearch removal for {entity_type} (id={entity_id})")
        
    except Exception as e:
        logger.error(f"Error queuing Meilisearch removal for {entity_type} (id={entity_id}): {e}")


def setup_search_sync_listeners():
    """
    Set up SQLAlchemy event listeners for automatic Meilisearch synchronization.
    
    Uses Celery tasks to avoid blocking database transactions.
    """
    from app.models.region import Region
    from app.models.country import Country
    from app.models.activity import Activity
    from app.models.attraction import Attraction
    from app.models.accommodation import Accommodation
    from app.models.package import Package
    from app.models.group_trip import GroupTrip
    from app.models.blog import BlogPost
    from app.models.hotel_type import HotelType
    from app.models.inclusion_exclusion import Inclusion, Exclusion
    
    # List of models to sync
    models_to_sync = [
        Region,
        Country,
        Activity,
        Attraction,
        Accommodation,
        Package,
        GroupTrip,
        BlogPost,
        HotelType,
        Inclusion,
        Exclusion,
    ]
    
    # Register event listeners for each model
    for model in models_to_sync:
        event.listen(model, 'after_insert', sync_to_meilisearch_after_insert)
        event.listen(model, 'after_update', sync_to_meilisearch_after_update)
        event.listen(model, 'after_delete', sync_to_meilisearch_after_delete)
        
        logger.info(f"Registered Celery-based Meilisearch sync listeners for {model.__name__}")
    
    logger.info("Celery-based Meilisearch sync listeners setup complete")
