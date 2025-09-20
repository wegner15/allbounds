import logging
from sqlalchemy.orm import Session

from app.services.search import search_service

logger = logging.getLogger(__name__)

async def index_all_entities(db: Session) -> dict:
    """
    Index all entities in Meilisearch.
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with index names as keys and success status as values
    """
    logger.info("Starting indexing of all entities")
    results = search_service.index_all(db)
    logger.info(f"Completed indexing of all entities: {results}")
    return results

async def index_entity(db: Session, entity_type: str, entity_id: int) -> bool:
    """
    Index a specific entity in Meilisearch.
    
    Args:
        db: Database session
        entity_type: Type of entity (e.g., "region", "country", "package")
        entity_id: ID of the entity
        
    Returns:
        True if indexed successfully, False otherwise
    """
    logger.info(f"Indexing {entity_type} with ID {entity_id}")
    
    if entity_type == "region":
        from app.models.region import Region
        entity = db.query(Region).filter(Region.id == entity_id).first()
        if entity:
            return search_service.update_region(entity)
    elif entity_type == "country":
        from app.models.country import Country
        entity = db.query(Country).filter(Country.id == entity_id).first()
        if entity:
            return search_service.update_country(entity)
    elif entity_type == "activity":
        from app.models.activity import Activity
        entity = db.query(Activity).filter(Activity.id == entity_id).first()
        if entity:
            # Implement update_activity in search_service
            return False
    elif entity_type == "attraction":
        from app.models.attraction import Attraction
        entity = db.query(Attraction).filter(Attraction.id == entity_id).first()
        if entity:
            # Implement update_attraction in search_service
            return False
    elif entity_type == "accommodation":
        from app.models.accommodation import Accommodation
        entity = db.query(Accommodation).filter(Accommodation.id == entity_id).first()
        if entity:
            # Implement update_accommodation in search_service
            return False
    elif entity_type == "package":
        from app.models.package import Package
        entity = db.query(Package).filter(Package.id == entity_id).first()
        if entity:
            # Implement update_package in search_service
            return False
    elif entity_type == "group_trip":
        from app.models.group_trip import GroupTrip
        entity = db.query(GroupTrip).filter(GroupTrip.id == entity_id).first()
        if entity:
            # Implement update_group_trip in search_service
            return False
    elif entity_type == "blog_post":
        from app.models.blog import BlogPost
        entity = db.query(BlogPost).filter(BlogPost.id == entity_id).first()
        if entity:
            # Implement update_blog_post in search_service
            return False
    
    logger.warning(f"Entity {entity_type} with ID {entity_id} not found or not supported")
    return False
