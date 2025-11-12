"""
Celery tasks for Meilisearch synchronization.
"""

import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name='app.tasks.search_tasks.sync_entity_to_meilisearch')
def sync_entity_to_meilisearch(entity_type: str, entity_id: int, operation: str = 'update'):
    """
    Sync a single entity to Meilisearch.
    
    Args:
        entity_type: Type of entity (e.g., 'Region', 'Package')
        entity_id: ID of the entity
        operation: Operation type ('insert', 'update', 'delete')
    """
    from app.services.search import search_service
    from app.db.database import SessionLocal
    
    logger.info(f"Celery task: Syncing {entity_type} (id={entity_id}) operation={operation}")
    
    try:
        if operation == 'delete':
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
                success = search_service.delete_from_index(index_map[entity_type], entity_id)
                if success:
                    logger.info(f"Celery: Removed {entity_type} (id={entity_id}) from Meilisearch")
                    return {'status': 'success', 'operation': 'delete'}
                else:
                    logger.warning(f"Celery: Failed to remove {entity_type} (id={entity_id}) from Meilisearch")
                    return {'status': 'failed', 'operation': 'delete'}
        else:
            # For insert/update, fetch the entity and sync it
            db = SessionLocal()
            try:
                # Import models dynamically
                model_map = {
                    'Region': 'app.models.region.Region',
                    'Country': 'app.models.country.Country',
                    'Activity': 'app.models.activity.Activity',
                    'Attraction': 'app.models.attraction.Attraction',
                    'Accommodation': 'app.models.accommodation.Accommodation',
                    'Package': 'app.models.package.Package',
                    'GroupTrip': 'app.models.group_trip.GroupTrip',
                    'BlogPost': 'app.models.blog.BlogPost',
                    'HotelType': 'app.models.hotel_type.HotelType',
                    'Inclusion': 'app.models.inclusion_exclusion.Inclusion',
                    'Exclusion': 'app.models.inclusion_exclusion.Exclusion',
                }
                
                if entity_type not in model_map:
                    logger.warning(f"Celery: Unknown entity type {entity_type}")
                    return {'status': 'failed', 'reason': 'unknown_entity_type'}
                
                # Import and get the model class
                module_path, class_name = model_map[entity_type].rsplit('.', 1)
                module = __import__(module_path, fromlist=[class_name])
                model_class = getattr(module, class_name)
                
                # Fetch the entity
                entity = db.query(model_class).filter(model_class.id == entity_id).first()
                
                if not entity:
                    logger.warning(f"Celery: Entity {entity_type} (id={entity_id}) not found")
                    return {'status': 'failed', 'reason': 'entity_not_found'}
                
                # Skip if inactive
                if hasattr(entity, 'is_active') and not entity.is_active:
                    logger.info(f"Celery: Skipping inactive {entity_type} (id={entity_id})")
                    return {'status': 'skipped', 'reason': 'inactive'}
                
                # Map to update methods
                update_map = {
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
                
                if entity_type in update_map:
                    success = update_map[entity_type](entity)
                    if success:
                        logger.info(f"Celery: Synced {entity_type} (id={entity_id}) to Meilisearch")
                        return {'status': 'success', 'operation': operation}
                    else:
                        logger.warning(f"Celery: Failed to sync {entity_type} (id={entity_id}) to Meilisearch")
                        return {'status': 'failed', 'operation': operation}
                        
            finally:
                db.close()
                
    except Exception as e:
        logger.error(f"Celery: Error syncing {entity_type} (id={entity_id}): {e}", exc_info=True)
        return {'status': 'error', 'error': str(e)}


@celery_app.task(name='app.tasks.search_tasks.bulk_index_entities')
def bulk_index_entities(entity_type: str):
    """
    Bulk index all entities of a specific type.
    
    Args:
        entity_type: Type of entity to index (e.g., 'packages', 'countries')
    """
    from app.services.search import search_service
    from app.db.database import SessionLocal
    
    logger.info(f"Celery task: Bulk indexing {entity_type}")
    
    db = SessionLocal()
    try:
        index_map = {
            'regions': search_service.index_regions,
            'countries': search_service.index_countries,
            'activities': search_service.index_activities,
            'attractions': search_service.index_attractions,
            'accommodations': search_service.index_accommodations,
            'packages': search_service.index_packages,
            'group_trips': search_service.index_group_trips,
            'blog_posts': search_service.index_blog_posts,
            'hotel_types': search_service.index_hotel_types,
            'inclusions': search_service.index_inclusions,
            'exclusions': search_service.index_exclusions,
        }
        
        if entity_type in index_map:
            success = index_map[entity_type](db)
            if success:
                logger.info(f"Celery: Successfully indexed {entity_type}")
                return {'status': 'success', 'entity_type': entity_type}
            else:
                logger.warning(f"Celery: Failed to index {entity_type}")
                return {'status': 'failed', 'entity_type': entity_type}
        else:
            logger.warning(f"Celery: Unknown entity type {entity_type}")
            return {'status': 'failed', 'reason': 'unknown_entity_type'}
            
    except Exception as e:
        logger.error(f"Celery: Error bulk indexing {entity_type}: {e}", exc_info=True)
        return {'status': 'error', 'error': str(e)}
    finally:
        db.close()


@celery_app.task(name='app.tasks.search_tasks.index_all_entities')
def index_all_entities():
    """
    Index all entities across all types.
    """
    from app.services.search import search_service
    from app.db.database import SessionLocal
    
    logger.info("Celery task: Indexing all entities")
    
    db = SessionLocal()
    try:
        results = search_service.index_all(db)
        logger.info(f"Celery: Indexed all entities - {results}")
        return {'status': 'success', 'results': results}
    except Exception as e:
        logger.error(f"Celery: Error indexing all entities: {e}", exc_info=True)
        return {'status': 'error', 'error': str(e)}
    finally:
        db.close()
