import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload

from app.search.meilisearch import meilisearch_client
from app.models.region import Region
from app.models.country import Country
from app.models.activity import Activity
from app.models.attraction import Attraction
from app.models.accommodation import Accommodation
from app.models.hotel import Hotel
from app.models.package import Package
from app.models.group_trip import GroupTrip
from app.models.blog import BlogPost
from app.models.hotel_type import HotelType
from app.models.inclusion_exclusion import Inclusion, Exclusion

logger = logging.getLogger(__name__)

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

    def _build_country_payload(self, country: Optional[Country]) -> Optional[Dict[str, Any]]:
        """
        Build a compact country payload suitable for search results.
        """
        if not country:
            return None

        return {
            'id': country.id,
            'name': country.name,
            'slug': country.slug,
            'image_id': country.image_id,
        }

    def _build_country_list_payload(self, countries: Optional[List[Country]]) -> List[Dict[str, Any]]:
        """
        Build a compact list of countries for entities linked to multiple destinations.
        """
        if not countries:
            return []

        payloads: List[Dict[str, Any]] = []
        for country in countries:
            payload = self._build_country_payload(country)
            if payload:
                payloads.append(payload)

        return payloads

    def _resolve_media_image_url(self, media_asset: Any) -> Optional[str]:
        """
        Convert a media asset relationship into a usable image URL for search results.
        """
        if not media_asset:
            return None

        url = getattr(media_asset, 'url', None)
        if url:
            return url

        storage_key = getattr(media_asset, 'storage_key', None)
        file_path = getattr(media_asset, 'file_path', None)

        from app.core.cloudflare_config import cloudflare_settings

        if storage_key:
            return f"{cloudflare_settings.delivery_url}/{storage_key}/medium"

        if isinstance(file_path, str) and file_path:
            if file_path.startswith("http"):
                return file_path
            if file_path.startswith("cloudflare://"):
                cf_id = file_path.split("cloudflare://", 1)[1]
                return f"{cloudflare_settings.delivery_url}/{cf_id}/medium"

        return None

    def _resolve_activity_image_url(self, activity: Activity) -> Optional[str]:
        """
        Resolve a search-friendly image URL for an activity.
        Checks cover image, gallery media assets, linked attractions, and country image fallback.
        """
        # 1. Check direct cover_image
        cover_image = getattr(activity, 'cover_image', None)
        image_url = self._resolve_media_image_url(cover_image)
        if image_url:
            return image_url

        cover_image_id = getattr(activity, 'cover_image_id', None)
        if cover_image_id:
            from app.db.database import SessionLocal
            from app.models.media import MediaAsset

            db = SessionLocal()
            try:
                media_asset = db.query(MediaAsset).filter(MediaAsset.id == cover_image_id).first()
                image_url = self._resolve_media_image_url(media_asset)
                if image_url:
                    return image_url
            finally:
                db.close()

        # 2. Check media_assets gallery
        media_assets = getattr(activity, 'media_assets', None)
        if media_assets:
            for asset in media_assets:
                image_url = self._resolve_media_image_url(asset)
                if image_url:
                    return image_url

        # 3. Check linked attractions
        attractions = getattr(activity, 'attractions', None)
        if attractions:
            for attr in attractions:
                image_url = self._resolve_attraction_image_url(attr)
                if image_url:
                    return image_url

        # 4. Fallback to primary country's image
        countries = getattr(activity, 'countries', None)
        if countries and len(countries) > 0:
            primary_country = countries[0]
            if primary_country and getattr(primary_country, 'image_id', None):
                return self._resolve_cloudflare_image_url(primary_country.image_id)

        return None

    def _resolve_attraction_image_url(self, attraction: Attraction) -> Optional[str]:
        """
        Resolve a search-friendly image URL for an attraction.
        """
        # Attraction.image_id is already intended to be a Cloudflare image ID,
        # but some rows may still carry a full URL or legacy file path.
        if getattr(attraction, 'image_id', None):
            image_id = attraction.image_id
            if isinstance(image_id, str) and image_id.startswith("http"):
                return image_id

            from app.core.cloudflare_config import cloudflare_settings
            return f"{cloudflare_settings.delivery_url}/{image_id}/medium"

        legacy_cover = getattr(attraction, 'cover_image', None)
        if legacy_cover:
            if isinstance(legacy_cover, str) and legacy_cover.startswith("http"):
                return legacy_cover
            from app.core.cloudflare_config import cloudflare_settings
            return f"{cloudflare_settings.delivery_url}/{legacy_cover}/medium"

        # Fallback to country image
        if getattr(attraction, 'country', None) and getattr(attraction.country, 'image_id', None):
            return self._resolve_cloudflare_image_url(attraction.country.image_id)

        return None

    def _resolve_cloudflare_image_url(self, image_id: Optional[str]) -> Optional[str]:
        """
        Resolve a Cloudflare image ID or URL into a delivery URL.
        """
        if not image_id:
            return None

        if isinstance(image_id, str):
            if image_id.startswith("http"):
                return image_id

            if image_id.startswith("cloudflare://"):
                image_id = image_id.split("cloudflare://", 1)[1]

        from app.core.cloudflare_config import cloudflare_settings

        if not cloudflare_settings.delivery_url:
            return None

        return f"{cloudflare_settings.delivery_url}/{image_id}/medium"
    
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
            'searchableAttributes': ['name', 'summary', 'description'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'image_id', 'image_url'],
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
            'searchableAttributes': ['name', 'summary', 'description'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'region_id', 'image_id', 'image_url'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active', 'region_id']
        },
        ACTIVITY_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'country_names'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'image_url', 'cover_image_id', 'country_id', 'country_name', 'country_slug', 'country_image_id', 'country_names', 'country_slugs', 'countries'],
            'sortableAttributes': ['name'],
            'filterableAttributes': ['is_active']
        },
        ATTRACTION_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'city', 'address', 'country_name'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'country_name', 'country_slug', 'country_image_id', 'country', 'image_id', 'image_url', 'cover_image', 'city', 'address', 'latitude', 'longitude', 'duration_minutes', 'price', 'opening_hours'],
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
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'duration_days', 'price', 'image_id', 'image_url', 'inclusion_items', 'exclusion_items'],
            'sortableAttributes': ['name', 'price', 'duration_days'],
            'filterableAttributes': ['is_active', 'country_id', 'is_featured', 'duration_days']
        },
        GROUP_TRIP_INDEX: {
            'searchableAttributes': ['name', 'summary', 'description', 'itinerary', 'inclusions', 'exclusions', 'inclusion_items', 'exclusion_items'],
            'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'duration_days', 'price', 'image_id', 'image_url', 'inclusion_items', 'exclusion_items'],
            'sortableAttributes': ['name', 'price', 'duration_days'],
            'filterableAttributes': ['is_active', 'country_id', 'is_featured', 'duration_days']
        },
        BLOG_POST_INDEX: {
            'searchableAttributes': ['title', 'summary', 'content'],
            'displayedAttributes': ['id', 'title', 'summary', 'slug', 'author', 'cover_image_id', 'image_url'],
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
                'summary': region.summary,
                'description': region.description,
                'slug': region.slug,
                'image_id': region.image_id,
                'image_url': self._resolve_cloudflare_image_url(region.image_id),
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
                'summary': country.summary,
                'description': country.description,
                'slug': country.slug,
                'region_id': country.region_id,
                'image_id': country.image_id,
                'image_url': self._resolve_cloudflare_image_url(country.image_id),
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
        activities = db.query(Activity).filter(Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.attractions),
            joinedload(Activity.countries),
        ).all()
        
        documents = []
        for activity in activities:
            countries = list(activity.countries or [])
            primary_country = countries[0] if countries else None
            countries_payload = self._build_country_list_payload(countries)

            # Resolve storage key / cloudflare UUID if available
            storage_key = None
            if activity.cover_image and getattr(activity.cover_image, 'storage_key', None):
                storage_key = activity.cover_image.storage_key
            elif activity.media_assets and len(activity.media_assets) > 0:
                storage_key = getattr(activity.media_assets[0], 'storage_key', None)

            documents.append({
                'id': activity.id,
                'name': activity.name,
                'summary': activity.summary,
                'description': activity.description,
                'slug': activity.slug,
                'image_url': self._resolve_activity_image_url(activity),
                'image_id': storage_key,
                'cover_image_id': storage_key or activity.cover_image_id,
                'country_id': primary_country.id if primary_country else None,
                'country_name': primary_country.name if primary_country else None,
                'country_slug': primary_country.slug if primary_country else None,
                'country_image_id': primary_country.image_id if primary_country else None,
                'country_names': ", ".join([country.name for country in countries if country.name]),
                'country_slugs': [country.slug for country in countries if country.slug],
                'countries': countries_payload,
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
        attractions = db.query(Attraction).filter(Attraction.is_active == True).options(
            joinedload(Attraction.country),
        ).all()
        
        documents = []
        for attraction in attractions:
            country_payload = self._build_country_payload(attraction.country)
            documents.append({
                'id': attraction.id,
                'name': attraction.name,
                'summary': attraction.summary,
                'description': attraction.description,
                'slug': attraction.slug,
                'country_id': attraction.country_id,
                'country_name': attraction.country.name if attraction.country else None,
                'country_slug': attraction.country.slug if attraction.country else None,
                'country_image_id': attraction.country.image_id if attraction.country else None,
                'image_id': attraction.image_id,
                'image_url': self._resolve_attraction_image_url(attraction),
                'cover_image': attraction.cover_image,
                'city': attraction.city,
                'address': attraction.address,
                'latitude': attraction.latitude,
                'longitude': attraction.longitude,
                'duration_minutes': attraction.duration_minutes,
                'price': attraction.price,
                'opening_hours': attraction.opening_hours,
                'country': country_payload,
                'is_active': attraction.is_active
            })
        
        return self.meilisearch_client.add_documents(self.ATTRACTION_INDEX, documents)
    
    def index_accommodations(self, db: Session) -> bool:
        """
        Index all active accommodations and hotels.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if accommodations were indexed successfully, False otherwise
        """
        documents = []

        # Index hotels from Hotel model
        hotels = db.query(Hotel).filter(Hotel.is_active == True).options(
            joinedload(Hotel.country),
        ).all()
        for hotel in hotels:
            country_payload = self._build_country_payload(hotel.country)
            documents.append({
                'id': hotel.id,
                'name': hotel.name,
                'summary': hotel.summary,
                'description': hotel.description,
                'slug': hotel.slug,
                'country_id': hotel.country_id,
                'country_name': hotel.country.name if hotel.country else None,
                'country_slug': hotel.country.slug if hotel.country else None,
                'country_image_id': hotel.country.image_id if hotel.country else None,
                'country': country_payload,
                'stars': hotel.stars,
                'city': hotel.city,
                'address': hotel.address,
                'price_category': hotel.price_category,
                'image_id': hotel.image_id,
                'image_url': self._resolve_cloudflare_image_url(hotel.image_id),
                'is_active': hotel.is_active
            })

        # Also index any legacy accommodations if present and not overlapping
        accommodations = db.query(Accommodation).filter(Accommodation.is_active == True).options(
            joinedload(Accommodation.country),
        ).all()
        existing_ids = {d['id'] for d in documents}
        for accommodation in accommodations:
            if accommodation.id not in existing_ids:
                country_payload = self._build_country_payload(accommodation.country)
                documents.append({
                    'id': accommodation.id,
                    'name': accommodation.name,
                    'summary': accommodation.summary,
                    'description': accommodation.description,
                    'slug': accommodation.slug,
                    'country_id': accommodation.country_id,
                    'country_name': accommodation.country.name if accommodation.country else None,
                    'country_slug': accommodation.country.slug if accommodation.country else None,
                    'country_image_id': accommodation.country.image_id if accommodation.country else None,
                    'country': country_payload,
                    'stars': accommodation.stars,
                    'address': accommodation.address,
                    'is_active': accommodation.is_active
                })

        if not documents:
            logger.info("No active accommodations/hotels found to index")
            return True
        
        return self.meilisearch_client.add_documents(self.ACCOMMODATION_INDEX, documents)
    
    def index_packages(self, db: Session) -> bool:
        """
        Index all active packages.
        
        Args:
            db: Database session
            
        Returns:
            bool: True if packages were indexed successfully, False otherwise
        """
        packages = db.query(Package).filter(Package.is_active == True).options(
            joinedload(Package.country),
        ).all()
        
        documents = []
        for package in packages:
            # Format inclusion and exclusion items for search
            inclusion_items_text = ""
            if package.inclusion_items:
                inclusion_items_text = ", ".join([inc.name for inc in package.inclusion_items])
            
            exclusion_items_text = ""
            if package.exclusion_items:
                exclusion_items_text = ", ".join([exc.name for exc in package.exclusion_items])
            
            country_payload = self._build_country_payload(package.country)
            documents.append({
                'id': package.id,
                'name': package.name,
                'summary': package.summary,
                'description': package.description,
                'slug': package.slug,
                'country_id': package.country_id,
                'country_name': package.country.name if package.country else None,
                'country_slug': package.country.slug if package.country else None,
                'country_image_id': package.country.image_id if package.country else None,
                'country': country_payload,
                'duration_days': package.duration_days,
                'price': package.price,
                'image_id': package.image_id,
                'image_url': self._resolve_cloudflare_image_url(package.image_id),
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
        group_trips = db.query(GroupTrip).filter(GroupTrip.is_active == True).options(
            joinedload(GroupTrip.country),
        ).all()
        
        documents = []
        for group_trip in group_trips:
            # Format inclusion and exclusion items for search
            inclusion_items_text = ""
            if group_trip.inclusion_items:
                inclusion_items_text = ", ".join([inc.name for inc in group_trip.inclusion_items])
            
            exclusion_items_text = ""
            if group_trip.exclusion_items:
                exclusion_items_text = ", ".join([exc.name for exc in group_trip.exclusion_items])
            
            country_payload = self._build_country_payload(group_trip.country)
            documents.append({
                'id': group_trip.id,
                'name': group_trip.name,
                'summary': group_trip.summary,
                'description': group_trip.description,
                'slug': group_trip.slug,
                'country_id': group_trip.country_id,
                'country_name': group_trip.country.name if group_trip.country else None,
                'country_slug': group_trip.country.slug if group_trip.country else None,
                'country_image_id': group_trip.country.image_id if group_trip.country else None,
                'country': country_payload,
                'duration_days': group_trip.duration_days,
                'price': group_trip.price,
                'image_id': group_trip.image_id,
                'image_url': self._resolve_cloudflare_image_url(group_trip.image_id),
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
            # Get author name if available, otherwise use author_id
            author_name = None
            if blog_post.author:
                author_name = getattr(blog_post.author, 'full_name', None) or getattr(blog_post.author, 'email', None)
            
            documents.append({
                'id': blog_post.id,
                'title': blog_post.title,
                'summary': blog_post.summary,
                'content': blog_post.content,
                'slug': blog_post.slug,
                'author': author_name,
                'cover_image_id': blog_post.cover_image_id,
                'image_url': self._resolve_cloudflare_image_url(blog_post.cover_image_id),
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
            'summary': region.summary,
            'description': region.description,
            'slug': region.slug,
            'image_id': region.image_id,
            'image_url': self._resolve_cloudflare_image_url(region.image_id),
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
            'summary': country.summary,
            'description': country.description,
            'slug': country.slug,
            'region_id': country.region_id,
            'image_id': country.image_id,
            'image_url': self._resolve_cloudflare_image_url(country.image_id),
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
    
    def update_activity(self, activity: Activity) -> bool:
        """
        Update an activity in the search index.
        
        Args:
            activity: Activity model instance
            
        Returns:
            bool: True if activity was updated successfully, False otherwise
        """
        document = {
            'id': activity.id,
            'name': activity.name,
            'summary': activity.summary,
            'description': activity.description,
            'slug': activity.slug,
            'image_url': self._resolve_activity_image_url(activity),
            'cover_image_id': activity.cover_image_id,
            'country_id': activity.countries[0].id if getattr(activity, 'countries', None) else None,
            'country_name': activity.countries[0].name if getattr(activity, 'countries', None) else None,
            'country_slug': activity.countries[0].slug if getattr(activity, 'countries', None) else None,
            'country_image_id': activity.countries[0].image_id if getattr(activity, 'countries', None) else None,
            'country_names': ", ".join([country.name for country in getattr(activity, 'countries', []) if country.name]),
            'country_slugs': [country.slug for country in getattr(activity, 'countries', []) if country.slug],
            'countries': self._build_country_list_payload(getattr(activity, 'countries', [])),
            'is_active': activity.is_active
        }
        
        return self.meilisearch_client.update_documents(self.ACTIVITY_INDEX, [document])
    
    def update_attraction(self, attraction: Attraction) -> bool:
        """
        Update an attraction in the search index.
        
        Args:
            attraction: Attraction model instance
            
        Returns:
            bool: True if attraction was updated successfully, False otherwise
        """
        document = {
            'id': attraction.id,
            'name': attraction.name,
            'summary': attraction.summary,
            'description': attraction.description,
            'slug': attraction.slug,
            'country_id': attraction.country_id,
            'country_name': attraction.country.name if attraction.country else None,
            'country_slug': attraction.country.slug if attraction.country else None,
            'country_image_id': attraction.country.image_id if attraction.country else None,
            'image_id': attraction.image_id,
            'image_url': self._resolve_attraction_image_url(attraction),
            'cover_image': attraction.cover_image,
            'city': attraction.city,
            'address': attraction.address,
            'latitude': attraction.latitude,
            'longitude': attraction.longitude,
            'duration_minutes': attraction.duration_minutes,
            'price': attraction.price,
            'opening_hours': attraction.opening_hours,
            'country': self._build_country_payload(attraction.country),
            'is_active': attraction.is_active
        }
        
        return self.meilisearch_client.update_documents(self.ATTRACTION_INDEX, [document])
    
    def update_accommodation(self, accommodation: Accommodation) -> bool:
        """
        Update an accommodation in the search index.
        
        Args:
            accommodation: Accommodation model instance
            
        Returns:
            bool: True if accommodation was updated successfully, False otherwise
        """
        document = {
            'id': accommodation.id,
            'name': accommodation.name,
            'summary': accommodation.summary,
            'description': accommodation.description,
            'slug': accommodation.slug,
            'country_id': accommodation.country_id,
            'stars': accommodation.stars,
            'address': accommodation.address,
            'is_active': accommodation.is_active
        }
        
        return self.meilisearch_client.update_documents(self.ACCOMMODATION_INDEX, [document])
    
    def update_package(self, package: Package) -> bool:
        """
        Update a package in the search index.
        
        Args:
            package: Package model instance
            
        Returns:
            bool: True if package was updated successfully, False otherwise
        """
        # Format inclusion and exclusion items for search
        inclusion_items_text = ""
        if package.inclusion_items:
            inclusion_items_text = ", ".join([inc.name for inc in package.inclusion_items])
        
        exclusion_items_text = ""
        if package.exclusion_items:
            exclusion_items_text = ", ".join([exc.name for exc in package.exclusion_items])
        
        document = {
            'id': package.id,
            'name': package.name,
            'summary': package.summary,
            'description': package.description,
            'slug': package.slug,
            'country_id': package.country_id,
            'country_name': package.country.name if getattr(package, 'country', None) else None,
            'country_slug': package.country.slug if getattr(package, 'country', None) else None,
            'country_image_id': package.country.image_id if getattr(package, 'country', None) else None,
            'country': self._build_country_payload(getattr(package, 'country', None)),
            'duration_days': package.duration_days,
            'price': package.price,
            'image_id': package.image_id,
            'image_url': self._resolve_cloudflare_image_url(package.image_id),
            'itinerary': package.itinerary,
            'inclusions': package.inclusions,
            'exclusions': package.exclusions,
            'inclusion_items': inclusion_items_text,
            'exclusion_items': exclusion_items_text,
            'is_active': package.is_active,
            'is_featured': package.is_featured
        }
        
        return self.meilisearch_client.update_documents(self.PACKAGE_INDEX, [document])
    
    def update_group_trip(self, group_trip: GroupTrip) -> bool:
        """
        Update a group trip in the search index.
        
        Args:
            group_trip: GroupTrip model instance
            
        Returns:
            bool: True if group trip was updated successfully, False otherwise
        """
        # Format inclusion and exclusion items for search
        inclusion_items_text = ""
        if group_trip.inclusion_items:
            inclusion_items_text = ", ".join([inc.name for inc in group_trip.inclusion_items])
        
        exclusion_items_text = ""
        if group_trip.exclusion_items:
            exclusion_items_text = ", ".join([exc.name for exc in group_trip.exclusion_items])
        
        document = {
            'id': group_trip.id,
            'name': group_trip.name,
            'summary': group_trip.summary,
            'description': group_trip.description,
            'slug': group_trip.slug,
            'country_id': group_trip.country_id,
            'country_name': group_trip.country.name if getattr(group_trip, 'country', None) else None,
            'country_slug': group_trip.country.slug if getattr(group_trip, 'country', None) else None,
            'country_image_id': group_trip.country.image_id if getattr(group_trip, 'country', None) else None,
            'country': self._build_country_payload(getattr(group_trip, 'country', None)),
            'duration_days': group_trip.duration_days,
            'price': group_trip.price,
            'image_id': group_trip.image_id,
            'image_url': self._resolve_cloudflare_image_url(group_trip.image_id),
            'itinerary': group_trip.itinerary,
            'inclusions': group_trip.inclusions,
            'exclusions': group_trip.exclusions,
            'inclusion_items': inclusion_items_text,
            'exclusion_items': exclusion_items_text,
            'is_active': group_trip.is_active,
            'is_featured': group_trip.is_featured
        }
        
        return self.meilisearch_client.update_documents(self.GROUP_TRIP_INDEX, [document])
    
    def update_blog_post(self, blog_post: BlogPost) -> bool:
        """
        Update a blog post in the search index.
        
        Args:
            blog_post: BlogPost model instance
            
        Returns:
            bool: True if blog post was updated successfully, False otherwise
        """
        # Get author name if available, otherwise use author_id
        author_name = None
        if blog_post.author:
            author_name = getattr(blog_post.author, 'full_name', None) or getattr(blog_post.author, 'email', None)
        
        document = {
            'id': blog_post.id,
            'title': blog_post.title,
            'summary': blog_post.summary,
            'content': blog_post.content,
            'slug': blog_post.slug,
            'author': author_name,
            'cover_image_id': blog_post.cover_image_id,
            'image_url': self._resolve_cloudflare_image_url(blog_post.cover_image_id),
            'published_at': blog_post.published_at.isoformat() if blog_post.published_at else None,
            'is_active': blog_post.is_active
        }
        
        return self.meilisearch_client.update_documents(self.BLOG_POST_INDEX, [document])

search_service = SearchService()
