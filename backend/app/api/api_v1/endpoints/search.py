from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.search import SearchQuery, SearchResults, MultiSearchResults, IndexingStatus
from app.services.search import search_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.post("/", response_model=MultiSearchResults)
def search(
    *,
    search_query: SearchQuery,
    db: Session = Depends(get_db),
) -> Any:
    """
    Search for entities matching the query.
    """
    results = search_service.search(
        search_query.query,
        search_query.index,
        search_query.limit,
        search_query.offset,
        search_query.filter,
        search_query.sort
    )
    
    if not results:
        return {"results": {}}
    
    # If searching in a specific index, wrap the result in a dict
    if search_query.index:
        return {"results": {search_query.index: results}}
    
    return {"results": results}

@router.post("/initialize", response_model=IndexingStatus)
def initialize_indexes(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Initialize all search indexes with their settings.
    """
    success = search_service.initialize_indexes()
    
    if success:
        return {
            "success": True,
            "message": "All search indexes initialized successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to initialize some search indexes"
        }

@router.post("/index-all", response_model=IndexingStatus)
def index_all(
    *,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all entities in the background.
    """
    # Run indexing in the background
    background_tasks.add_task(search_service.index_all, db)
    
    return {
        "success": True,
        "message": "Indexing started in the background"
    }

@router.post("/index-regions", response_model=IndexingStatus)
def index_regions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all regions.
    """
    success = search_service.index_regions(db)
    
    if success:
        return {
            "success": True,
            "message": "Regions indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index regions"
        }

@router.post("/index-countries", response_model=IndexingStatus)
def index_countries(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all countries.
    """
    success = search_service.index_countries(db)
    
    if success:
        return {
            "success": True,
            "message": "Countries indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index countries"
        }

@router.post("/index-activities", response_model=IndexingStatus)
def index_activities(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all activities.
    """
    success = search_service.index_activities(db)
    
    if success:
        return {
            "success": True,
            "message": "Activities indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index activities"
        }

@router.post("/index-attractions", response_model=IndexingStatus)
def index_attractions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all attractions.
    """
    success = search_service.index_attractions(db)
    
    if success:
        return {
            "success": True,
            "message": "Attractions indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index attractions"
        }

@router.post("/index-accommodations", response_model=IndexingStatus)
def index_accommodations(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all accommodations.
    """
    success = search_service.index_accommodations(db)
    
    if success:
        return {
            "success": True,
            "message": "Accommodations indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index accommodations"
        }

@router.post("/index-packages", response_model=IndexingStatus)
def index_packages(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all packages.
    """
    success = search_service.index_packages(db)
    
    if success:
        return {
            "success": True,
            "message": "Packages indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index packages"
        }

@router.post("/index-group-trips", response_model=IndexingStatus)
def index_group_trips(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all group trips.
    """
    success = search_service.index_group_trips(db)
    
    if success:
        return {
            "success": True,
            "message": "Group trips indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index group trips"
        }

@router.post("/index-blog-posts", response_model=IndexingStatus)
def index_blog_posts(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("search:admin")),
) -> Any:
    """
    Index all blog posts.
    """
    success = search_service.index_blog_posts(db)
    
    if success:
        return {
            "success": True,
            "message": "Blog posts indexed successfully"
        }
    else:
        return {
            "success": False,
            "message": "Failed to index blog posts"
        }

@router.get("/health", response_model=Dict[str, bool])
def health_check() -> Any:
    """
    Check if Meilisearch is healthy.
    """
    return {"healthy": search_service.meilisearch_client.health_check()}
