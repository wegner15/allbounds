from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.search.meilisearch import meilisearch_client
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

class SearchService:
    """
    Service for handling search functionality using Meilisearch.
    """
    
    def __init__(self):
        """
        Initialize the SearchService with a reference to the meilisearch_client.
        """
        from app.search.meilisearch import meilisearch_client
        self.meilisearch_client = meilisearch_client
    
    # Define index names for each entity type
    REGION_INDEX = 'regions'
    COUNTRY_INDEX = 'countries'
    ACTIVITY_INDEX = 'activities'
    ATTRACTION_INDEX = 'attractions'
    ACCOMMODATION_INDEX = 'accommodations'
    PACKAGE_INDEX = 'packages'
    GROUP_TRIP_INDEX = 'group_trips'
    BLOG_POST_INDEX = 'blog_posts'
    HOTEL_TYPE_INDEX = 'hotel_types'
    INCLUSION_INDEX = 'inclusions'
    EXCLUSION_INDEX = 'exclusions'
    
    # Define searchable attributes for each index
    INDEX_SETTINGS = {
        REGION_INDEX: {
            'searchableAttributes': ['name', 'description'],
            'displayedAttributes': ['id', 'name', 'description', 'slug'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active']
        },
        INCLUSION_INDEX: {
            'searchableAttributes': ['name', 'description', 'category'],
            'displayedAttributes': ['id', 'name', 'description', 'icon', 'category'],
            'sortableAttributes': ['name', 'category'],
            'filterableAttributes': ['is_active', 'category']
        },
        EXCLUSION_INDEX: {
            'searchableAttributes': ['name', 'description', 'category'],
            'displayedAttributes': ['id', 'name', 'description', 'icon', 'category'],
            'sortableAttributes': ['name', 'category'],
            'filterableAttributes': ['is_active', 'category']
        },
        HOTEL_TYPE_INDEX: {
            'searchableAttributes': ['name', 'description'],
            'displayedAttributes': ['id', 'name', 'description', 'slug'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active']
        },
        COUNTRY_INDEX: {
            'searchableAttributes': ['name', 'description'],
            'displayedAttributes': ['id', 'name', 'description', 'slug', 'region_id'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active', 'region_id']
        },
        ACTIVITY_INDEX: {
            'searchableAttributes': ['name', 'description'],
            'displayedAttributes': ['id', 'name', 'description', 'slug'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active']
        },
        ATTRACTION_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active', 'country_id']
        },
        ACCOMMODATION_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'address'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'stars', 'address'],
            'sortableAttributes': ['name', 'stars'],
            'filterableAttributes': ['is_active', 'country_id', 'stars']
        },
        PACKAGE_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'itinerary', 'inclusions', 'exclusions', 'inclusion_items', 'exclusion_items'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'duration_days', 'price', 'inclusion_items', 'exclusion_items'],
            'sortableAttributes': ['name', 'price', 'duration_days'],
            'filterableAttributes': ['is_active', 'country_id', 'is_featured', 'duration_days']
        },
        GROUP_TRIP_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'itinerary', 'inclusions', 'exclusions', 'inclusion_items', 'exclusion_items'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'duration_days', 'price', 'inclusion_items', 'exclusion_items'],
            'sortableAttributes': ['name', 'price', 'duration_days'],
            'filterableAttributes': ['is_active', 'country_id', 'is_featured', 'duration_days']
        },
        BLOG_POST_INDEX: {
            'searchableAttributes': ['title', 'summary', 'content'],
            'displayedAttributes': ['id', 'title', 'summary', 'slug', 'author'],
            'sortableAttributes': ['title', 'published_at'],
            'filterableAttributes': ['is_active', 'published_at']
        }
    }
    
    def initialize_indexes(self) -> bool:
        """
        Initialize all search indexes with their settings.
        
        Returns:
            bool: True if all indexes were initialized successfully, False otherwise
        """
        success = True
        
        for index_name, settings in self.INDEX_SETTINGS.items():
            # Create the index
            if not self.meilisearch_client.create_index(index_name):
                success = False
                continue
            
            # Configure index settings
            if not self.meilisearch_client.configure_index_settings(index_name, settings):
                success = False
        
        return success
    
    def index_regions(self, db: Session) -> bool:
        """
        Index all active regions.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if regions were indexed successfully, False otherwise
        """
        regions = db.query(Region).filter(Region.is_active == True).all()
        
        documents = []
        for region in regions:
            documents.append({
                'id': region.id,
                'name': region.name,
                'description': region.description,
                'slug': region.slug,
                'is_active': region.is_active
            })
        
        return self.meilisearch_client.add_documents(self.REGION_INDEX, documents)
    
    def index_countries(self, db: Session) -> bool:
        """
        Index all active countries.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if countries were indexed successfully, False otherwise
        """
        countries = db.query(Country).filter(Country.is_active == True).all()
        
        documents = []
        for country in countries:
            documents.append({
                'id': country.id,
                'name': country.name,
                'description': country.description,
                'slug': country.slug,
                'region_id': country.region_id,
                'is_active': country.is_active
            })
        
        return self.meilisearch_client.add_documents(self.COUNTRY_INDEX, documents)
    
    def index_activities(self, db: Session) -> bool:
        """
        Index all active activities.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if activities were indexed successfully, False otherwise
        """
        activities = db.query(Activity).filter(Activity.is_active == True).all()
        
        documents = []
        for activity in activities:
            documents.append({
                'id': activity.id,
                'name': activity.name,
                'description': activity.description,
                'slug': activity.slug,
                'is_active': activity.is_active
            })
        
        return self.meilisearch_client.add_documents(self.ACTIVITY_INDEX, documents)
    
    def index_attractions(self, db: Session) -> bool:
        """
        Index all active attractions.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if attractions were indexed successfully, False otherwise
        """
        attractions = db.query(Attraction).filter(Attraction.is_active == True).all()
        
        documents = []
        for attraction in attractions:
            documents.append({
                'id': attraction.id,
                'name': attraction.name,
                'summary': attraction.summary,
                'description': attraction.description,
                'slug': attraction.slug,
                'country_id': attraction.country_id,
                'is_active': attraction.is_active
            })
        
        return self.meilisearch_client.add_documents(self.ATTRACTION_INDEX, documents)
    
    def index_accommodations(self, db: Session) -> bool:
        """
        Index all active accommodations.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if accommodations were indexed successfully, False otherwise
        """
        accommodations = db.query(Accommodation).filter(Accommodation.is_active == True).all()
        
        documents = []
        for accommodation in accommodations:
            documents.append({
                'id': accommodation.id,
                'name': accommodation.name,
                'summary': accommodation.summary,
                'description': accommodation.description,
                'slug': accommodation.slug,
                'country_id': accommodation.country_id,
                'stars': accommodation.stars,
                'address': accommodation.address,
                'is_active': accommodation.is_active
            })
        
        return self.meilisearch_client.add_documents(self.ACCOMMODATION_INDEX, documents)
    
    def index_packages(self, db: Session) -> bool:
        """
        Index all active packages.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if packages were indexed successfully, False otherwise
        """
        packages = db.query(Package).filter(Package.is_active == True).all()
        
        documents = []
        for package in packages:
            # Format inclusion and exclusion items for search
            inclusion_items_text = ""
            if package.inclusion_items:
                inclusion_items_text = ", ".join([inc.name for inc in package.inclusion_items])
            
            exclusion_items_text = ""
            if package.exclusion_items:
                exclusion_items_text = ", ".join([exc.name for exc in package.exclusion_items])
            
            documents.append({
                'id': package.id,
                'name': package.name,
                'summary': package.summary,
                'description': package.description,
                'slug': package.slug,
                'country_id': package.country_id,
                'duration_days': package.duration_days,
                'price': package.price,
                'itinerary': package.itinerary,
                'inclusions': package.inclusions,
                'exclusions': package.exclusions,
                'inclusion_items': inclusion_items_text,
                'exclusion_items': exclusion_items_text,
                'is_active': package.is_active,
                'is_featured': package.is_featured
            })
        
        return self.meilisearch_client.add_documents(self.PACKAGE_INDEX, documents)
    
    def index_group_trips(self, db: Session) -> bool:
        """
        Index all active group trips.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if group trips were indexed successfully, False otherwise
        """
        group_trips = db.query(GroupTrip).filter(GroupTrip.is_active == True).all()
        
        documents = []
        for group_trip in group_trips:
            # Format inclusion and exclusion items for search
            inclusion_items_text = ""
            if group_trip.inclusion_items:
                inclusion_items_text = ", ".join([inc.name for inc in group_trip.inclusion_items])
            
            exclusion_items_text = ""
            if group_trip.exclusion_items:
                exclusion_items_text = ", ".join([exc.name for exc in group_trip.exclusion_items])
            
            documents.append({
                'id': group_trip.id,
                'name': group_trip.name,
                'summary': group_trip.summary,
                'description': group_trip.description,
                'slug': group_trip.slug,
                'country_id': group_trip.country_id,
                'duration_days': group_trip.duration_days,
                'price': group_trip.price,
                'itinerary': group_trip.itinerary,
                'inclusions': group_trip.inclusions,
                'exclusions': group_trip.exclusions,
                'inclusion_items': inclusion_items_text,
                'exclusion_items': exclusion_items_text,
                'is_active': group_trip.is_active,
                'is_featured': group_trip.is_featured
            })
        
        return self.meilisearch_client.add_documents(self.GROUP_TRIP_INDEX, documents)
    
    def index_blog_posts(self, db: Session) -> bool:
        """
        Index all active blog posts.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if blog posts were indexed successfully, False otherwise
        """
        blog_posts = db.query(BlogPost).filter(BlogPost.is_active == True).all()
        
        documents = []
        for blog_post in blog_posts:
            documents.append({
                'id': blog_post.id,
                'title': blog_post.title,
                'summary': blog_post.summary,
                'content': blog_post.content,
                'slug': blog_post.slug,
                'author': blog_post.author,
                'published_at': blog_post.published_at.isoformat() if blog_post.published_at else None,
                'is_active': blog_post.is_active
            })
        
        return self.meilisearch_client.add_documents(self.BLOG_POST_INDEX, documents)
    
    def index_hotel_types(self, db: Session) -> bool:
        """
        Index all active hotel types.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if hotel types were indexed successfully, False otherwise
        """
        hotel_types = db.query(HotelType).filter(HotelType.is_active == True).all()
        
        documents = []
        for hotel_type in hotel_types:
            documents.append({
                'id': hotel_type.id,
                'name': hotel_type.name,
                'description': hotel_type.description,
                'slug': hotel_type.slug,
                'is_active': hotel_type.is_active
            })
        
        return self.meilisearch_client.add_documents(self.HOTEL_TYPE_INDEX, documents)
    
    def index_all(self, db: Session) -> Dict[str, bool]:
        """
        Index all entities.
        
        Args:
            db: Database session
            
        Returns:
            dict: Dictionary with index names as keys and success status as values
        """
        return {
            self.REGION_INDEX: self.index_regions(db),
            self.COUNTRY_INDEX: self.index_countries(db),
            self.ACTIVITY_INDEX: self.index_activities(db),
            self.ATTRACTION_INDEX: self.index_attractions(db),
            self.ACCOMMODATION_INDEX: self.index_accommodations(db),
            self.PACKAGE_INDEX: self.index_packages(db),
            self.GROUP_TRIP_INDEX: self.index_group_trips(db),
            self.BLOG_POST_INDEX: self.index_blog_posts(db),
            self.HOTEL_TYPE_INDEX: self.index_hotel_types(db),
            self.INCLUSION_INDEX: self.index_inclusions(db),
            self.EXCLUSION_INDEX: self.index_exclusions(db)
        }
    
    def update_region(self, region: Region) -> bool:
        """
        Update a region in the search index.
        
        Args:
            region: Region model instance
            
        Returns:
            bool: True if region was updated successfully, False otherwise
        """
        document = {
            'id': region.id,
            'name': region.name,
            'description': region.description,
            'slug': region.slug,
            'is_active': region.is_active
        }
        
        return self.meilisearch_client.update_documents(self.REGION_INDEX, [document])
    
    def update_country(self, country: Country) -> bool:
        """
        Update a country in the search index.
        
        Args:
            country: Country model instance
            
        Returns:
            bool: True if country was updated successfully, False otherwise
        """
        document = {
            'id': country.id,
            'name': country.name,
            'description': country.description,
            'slug': country.slug,
            'region_id': country.region_id,
            'is_active': country.is_active
        }
        
        return self.meilisearch_client.update_documents(self.COUNTRY_INDEX, [document])
    
    def update_hotel_type(self, hotel_type: HotelType) -> bool:
        """
        Update a hotel type in the search index.
        
        Args:
            hotel_type: HotelType model instance
            
        Returns:
            bool: True if hotel type was updated successfully, False otherwise
        """
        document = {
            'id': hotel_type.id,
            'name': hotel_type.name,
            'description': hotel_type.description,
            'slug': hotel_type.slug,
            'is_active': hotel_type.is_active
        }
        
        return self.meilisearch_client.update_documents(self.HOTEL_TYPE_INDEX, [document])
    
    def search(self, query: str, index_name: Optional[str] = None, limit: int = 20, offset: int = 0,
              filter: Optional[str] = None, sort: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Search for entities matching the query.
        
        Args:
            query: Search query
            index_name: Optional index name to search in a specific index
            limit: Maximum number of results to return
            offset: Number of results to skip
            filter: Filter expression
            sort: List of sort expressions
            
        Returns:
            dict: Search results
        """
        if index_name:
            return self.meilisearch_client.search(index_name, query, limit, offset, filter, sort)
        
        # Search in all indexes
        results = {}
        for index_name in self.INDEX_SETTINGS.keys():
            results[index_name] = self.meilisearch_client.search(index_name, query, limit, offset, filter, sort)
        
        return results
    
    def delete_from_index(self, index_name: str, document_id: int) -> bool:
        """
        Delete a document from a search index.
        
        Args:
            index_name: Name of the index
            document_id: ID of the document to delete
            
        Returns:
            bool: True if document was deleted successfully, False otherwise
        """
        return self.meilisearch_client.delete_document(index_name, document_id)

    def index_inclusions(self, db: Session) -> bool:
        """
        Index all active inclusions.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if inclusions were indexed successfully, False otherwise
        """
        inclusions = db.query(Inclusion).filter(Inclusion.is_active == True).all()
        
        documents = []
        for inclusion in inclusions:
            documents.append({
                'id': inclusion.id,
                'name': inclusion.name,
                'description': inclusion.description,
                'icon': inclusion.icon,
                'category': inclusion.category,
                'is_active': inclusion.is_active
            })
        
        return self.meilisearch_client.add_documents(self.INCLUSION_INDEX, documents)
    
    def index_exclusions(self, db: Session) -> bool:
        """
        Index all active exclusions.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if exclusions were indexed successfully, False otherwise
        """
        exclusions = db.query(Exclusion).filter(Exclusion.is_active == True).all()
        
        documents = []
        for exclusion in exclusions:
            documents.append({
                'id': exclusion.id,
                'name': exclusion.name,
                'description': exclusion.description,
                'icon': exclusion.icon,
                'category': exclusion.category,
                'is_active': exclusion.is_active
            })
        
        return self.meilisearch_client.add_documents(self.EXCLUSION_INDEX, documents)
    
    def update_inclusion(self, inclusion: Inclusion) -> bool:
        """
        Update an inclusion in the search index.
        
        Args:
            inclusion: Inclusion model instance
            
        Returns:
            bool: True if inclusion was updated successfully, False otherwise
        """
        document = {
            'id': inclusion.id,
            'name': inclusion.name,
            'description': inclusion.description,
            'icon': inclusion.icon,
            'category': inclusion.category,
            'is_active': inclusion.is_active
        }
        
        return self.meilisearch_client.update_documents(self.INCLUSION_INDEX, [document])
    
    def update_exclusion(self, exclusion: Exclusion) -> bool:
        """
        Update an exclusion in the search index.
        
        Args:
            exclusion: Exclusion model instance
            
        Returns:
            bool: True if exclusion was updated successfully, False otherwise
        """
        document = {
            'id': exclusion.id,
            'name': exclusion.name,
            'description': exclusion.description,
            'icon': exclusion.icon,
            'category': exclusion.category,
            'is_active': exclusion.is_active
        }
        
        return self.meilisearch_client.update_documents(self.EXCLUSION_INDEX, [document])

search_service = SearchService()
