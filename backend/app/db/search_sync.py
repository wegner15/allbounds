"""
Database event listeners for automatic Meilisearch synchronization.

This module sets up SQLAlchemy event listeners that automatically sync
database changes to Meilisearch indexes.
"""

import logging
from sqlalchemy import event
from sqlalchemy.orm import Session

logger = logging.getLogger("app.search_sync")


def sync_to_meilisearch_after_insert(mapper, connection, target):
    """
    Sync entity to Meilisearch after insert.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was inserted
    """
    from app.services.search import search_service
    
    entity_type = target.__class__.__name__
    
    try:
        # Only sync if entity is active
        if hasattr(target, 'is_active') and not target.is_active:
            logger.debug(f"Skipping Meilisearch sync for inactive {entity_type} (id={target.id})")
            return
        
        # Map entity types to search service update methods
        sync_map = {
            'Region': search_service.update_region,
            'Country': search_service.update_country,
            'Activity': search_service.update_activity,
            'Attraction': search_service.update_attraction,
            'Accommodation': search_service.update_accommodation,
            'Package': search_service.update_package,
            'GroupTrip': search_service.update_group_trip,
            'BlogPost': search_service.update_blog_post,
            'HotelType': search_service.update_hotel_type,
            'Inclusion': search_service.update_inclusion,
            'Exclusion': search_service.update_exclusion,
        }
        
        if entity_type in sync_map:
            success = sync_map[entity_type](target)
            if success:
                logger.info(f"Synced {entity_type} (id={target.id}) to Meilisearch after insert")
            else:
                logger.warning(f"Failed to sync {entity_type} (id={target.id}) to Meilisearch after insert")
        else:
            logger.debug(f"No Meilisearch sync configured for {entity_type}")
            
    except Exception as e:
        logger.error(f"Error syncing {entity_type} (id={target.id}) to Meilisearch after insert: {e}")


def sync_to_meilisearch_after_update(mapper, connection, target):
    """
    Sync entity to Meilisearch after update.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was updated
    """
    from app.services.search import search_service
    
    entity_type = target.__class__.__name__
    
    try:
        # Map entity types to search service methods
        sync_map = {
            'Region': search_service.update_region,
            'Country': search_service.update_country,
            'Activity': search_service.update_activity,
            'Attraction': search_service.update_attraction,
            'Accommodation': search_service.update_accommodation,
            'Package': search_service.update_package,
            'GroupTrip': search_service.update_group_trip,
            'BlogPost': search_service.update_blog_post,
            'HotelType': search_service.update_hotel_type,
            'Inclusion': search_service.update_inclusion,
            'Exclusion': search_service.update_exclusion,
        }
        
        if entity_type in sync_map:
            # If entity is now inactive, delete from index
            if hasattr(target, 'is_active') and not target.is_active:
                index_map = {
                    'Region': search_service.REGION_INDEX,
                    'Country': search_service.COUNTRY_INDEX,
                    'Activity': search_service.ACTIVITY_INDEX,
                    'Attraction': search_service.ATTRACTION_INDEX,
                    'Accommodation': search_service.ACCOMMODATION_INDEX,
                    'Package': search_service.PACKAGE_INDEX,
                    'GroupTrip': search_service.GROUP_TRIP_INDEX,
                    'BlogPost': search_service.BLOG_POST_INDEX,
                    'HotelType': search_service.HOTEL_TYPE_INDEX,
                    'Inclusion': search_service.INCLUSION_INDEX,
                    'Exclusion': search_service.EXCLUSION_INDEX,
                }
                success = search_service.delete_from_index(index_map[entity_type], target.id)
                if success:
                    logger.info(f"Removed inactive {entity_type} (id={target.id}) from Meilisearch")
                else:
                    logger.warning(f"Failed to remove inactive {entity_type} (id={target.id}) from Meilisearch")
            else:
                # Update in index
                success = sync_map[entity_type](target)
                if success:
                    logger.info(f"Synced {entity_type} (id={target.id}) to Meilisearch after update")
                else:
                    logger.warning(f"Failed to sync {entity_type} (id={target.id}) to Meilisearch after update")
        else:
            logger.debug(f"No Meilisearch sync configured for {entity_type}")
            
    except Exception as e:
        logger.error(f"Error syncing {entity_type} (id={target.id}) to Meilisearch after update: {e}")


def sync_to_meilisearch_after_delete(mapper, connection, target):
    """
    Remove entity from Meilisearch after delete.
    
    Args:
        mapper: SQLAlchemy mapper
        connection: Database connection
        target: The entity instance that was deleted
    """
    from app.services.search import search_service
    
    entity_type = target.__class__.__name__
    
    try:
        # Map entity types to index names
        index_map = {
            'Region': search_service.REGION_INDEX,
            'Country': search_service.COUNTRY_INDEX,
            'Activity': search_service.ACTIVITY_INDEX,
            'Attraction': search_service.ATTRACTION_INDEX,
            'Accommodation': search_service.ACCOMMODATION_INDEX,
            'Package': search_service.PACKAGE_INDEX,
            'GroupTrip': search_service.GROUP_TRIP_INDEX,
            'BlogPost': search_service.BLOG_POST_INDEX,
            'HotelType': search_service.HOTEL_TYPE_INDEX,
            'Inclusion': search_service.INCLUSION_INDEX,
            'Exclusion': search_service.EXCLUSION_INDEX,
        }
        
        if entity_type in index_map:
            success = search_service.delete_from_index(index_map[entity_type], target.id)
            if success:
                logger.info(f"Removed {entity_type} (id={target.id}) from Meilisearch after delete")
            else:
                logger.warning(f"Failed to remove {entity_type} (id={target.id}) from Meilisearch after delete")
        else:
            logger.debug(f"No Meilisearch sync configured for {entity_type}")
            
    except Exception as e:
        logger.error(f"Error removing {entity_type} (id={target.id}) from Meilisearch after delete: {e}")


def setup_search_sync_listeners():
    """
    Set up SQLAlchemy event listeners for automatic Meilisearch synchronization.
    
    This function registers event listeners for insert, update, and delete operations
    on entities that should be synced to Meilisearch.
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
        
        logger.info(f"Registered Meilisearch sync listeners for {model.__name__}")
    
    logger.info("Meilisearch sync listeners setup complete")
