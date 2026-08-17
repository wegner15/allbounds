from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.country import Country
from app.schemas.country import CountryCreate, CountryUpdate
from app.utils.slug import create_slug, ensure_unique_slug, update_slug_if_name_changed
from app.schemas.amenity import AmenityResponse
from app.core.cloudflare_config import cloudflare_settings


def _cloudflare_image_url(image_id: Optional[str], variant: str = "medium") -> Optional[str]:
    if not image_id:
        return None
    return f"{cloudflare_settings.delivery_url}/{image_id}/{variant}"


def _resolve_media_asset_url(media_asset) -> Optional[str]:
    if not media_asset or not getattr(media_asset, "is_active", True):
        return None

    storage_key = getattr(media_asset, "storage_key", None)
    file_path = getattr(media_asset, "file_path", None)

    if storage_key:
        return _cloudflare_image_url(storage_key)

    if isinstance(file_path, str) and file_path:
        if file_path.startswith("http"):
            return file_path
        if file_path.startswith("cloudflare://"):
            # Remove scheme and use remaining as Cloudflare ID
            parts = file_path.split("cloudflare://", 1)
            if len(parts) == 2 and parts[1]:
                return _cloudflare_image_url(parts[1])
        return _cloudflare_image_url(file_path)

    return None


def _get_hotel_cover_image(hotel) -> Optional[str]:
    primary = _cloudflare_image_url(getattr(hotel, "image_id", None))
    if primary:
        return primary

    for media in getattr(hotel, "media_assets", []) or []:
        asset_url = _resolve_media_asset_url(media)
        if asset_url:
            return asset_url

    return None

class CountryService:
    def get_countries(self, db: Session, skip: int = 0, limit: int = 100, is_favorite: Optional[bool] = None) -> List[Country]:
        """
        Retrieve all countries with pagination.
        """
        from sqlalchemy.orm import selectinload
        from sqlalchemy import desc
        
        query = db.query(Country).options(
            selectinload(Country.packages)
        ).filter(Country.is_active == True)
        
        if is_favorite is not None:
            query = query.filter(Country.is_favorite == is_favorite)
            
        return query.order_by(desc(Country.is_favorite), Country.name).offset(skip).limit(limit).all()
    
    def get_countries_by_region(self, db: Session, region_id: int, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve all countries for a specific region with pagination.
        """
        from sqlalchemy.orm import selectinload
        return db.query(Country).options(
            selectinload(Country.packages)
        ).filter(
            Country.region_id == region_id,
            Country.is_active == True
        ).offset(skip).limit(limit).all()

    def get_countries_with_hotels(self, db: Session, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve countries that have active hotels.
        """
        from app.models.hotel import Hotel

        return db.query(Country).join(Hotel).filter(
            Country.is_active == True,
            Hotel.is_active == True
        ).group_by(Country.id).offset(skip).limit(limit).all()

    def get_countries_with_packages(self, db: Session, skip: int = 0, limit: int = 100, package_type: Optional[str] = None) -> List[Country]:
        """
        Retrieve countries that have active packages, optionally filtered by package_type (safari or holiday).
        """
        from app.models.package import Package

        query = db.query(Country).join(Package).filter(
            Country.is_active == True,
            Package.is_active == True
        )
        if package_type:
            query = query.filter(Package.package_type == package_type)
            
        return query.group_by(Country.id).offset(skip).limit(limit).all()

    def get_countries_with_activities(self, db: Session, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve countries that have active and featured activities.
        """
        from app.models.activity import Activity

        return db.query(Country).join(
            Country.activities
        ).filter(
            Country.is_active == True,
            Activity.is_active == True,
            Activity.is_featured == True
        ).group_by(Country.id).offset(skip).limit(limit).all()

    def get_countries_with_attractions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve countries that have active attractions.
        """
        from app.models.attraction import Attraction

        return db.query(Country).join(
            Country.attractions
        ).filter(
            Country.is_active == True,
            Attraction.is_active == True
        ).group_by(Country.id).offset(skip).limit(limit).all()

    def get_countries_by_holiday_type(self, db: Session, holiday_type_slug: str, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve countries that have packages with the specified holiday type.
        """
        from app.models.package import Package
        from app.models.holiday_type import HolidayType

        return db.query(Country).join(Package).join(HolidayType, Package.holiday_types).filter(
            Country.is_active == True,
            Package.is_active == True,
            HolidayType.slug == holiday_type_slug,
            HolidayType.is_active == True
        ).group_by(Country.id).offset(skip).limit(limit).all()

    def get_country(self, db: Session, country_id: int) -> Optional[Country]:
        """
        Retrieve a specific country by ID.
        """
        return db.query(Country).filter(Country.id == country_id, Country.is_active == True).first()

    def get_country_for_admin(self, db: Session, country_id: int) -> Optional[Country]:
        """
        Retrieve a specific country by ID for admin purposes (does not check is_active).
        """
        return db.query(Country).filter(Country.id == country_id).first()
    
    def get_country_by_slug(self, db: Session, slug: str) -> Optional[Country]:
        """
        Retrieve a specific country by slug.
        """
        return db.query(Country).filter(Country.slug == slug, Country.is_active == True).first()
    
    def get_country_details_by_slug(self, db: Session, slug: str) -> Optional[dict]:
        """
        Retrieve a specific country by slug with all related destinations data.
        """
        from sqlalchemy.orm import selectinload
        from app.models.package import Package
        from app.models.group_trip import GroupTrip, GroupTripDeparture
        from app.models.activity import Activity
        from app.models.hotel import Hotel

        country = db.query(Country).options(
            selectinload(Country.region),
            selectinload(Country.packages).selectinload(Package.price_charts),
            selectinload(Country.group_trips).selectinload(GroupTrip.departures),
            selectinload(Country.group_trips).selectinload(GroupTrip.price_charts),
            selectinload(Country.attractions),
            selectinload(Country.accommodations),
            selectinload(Country.hotels).selectinload(Hotel.media_assets),
            selectinload(Country.hotels).selectinload(Hotel.amenities),
            selectinload(Country.hotels).selectinload(Hotel.price_charts),
            selectinload(Country.activities).selectinload(Activity.cover_image),
            selectinload(Country.media_assets),
            selectinload(Country.visit_info)
        ).filter(Country.slug == slug, Country.is_active == True).first()


        
        if not country:
            return None
            
        # Convert to dict with related data
        country_dict = {
            "id": country.id,
            "name": country.name,
            "description": country.description,
            "slug": country.slug,
            "region_id": country.region_id,
            "image_id": country.image_id,
            "faqs": country.faqs,
            "highlights": country.highlights,
            "category_intros": country.category_intros,
            "is_active": country.is_active,

            "created_at": country.created_at,
            "updated_at": country.updated_at,
            "region": {
                "id": country.region.id,
                "name": country.region.name,
                "slug": country.region.slug,
                "description": country.region.description,
                "image_id": country.region.image_id,
            } if country.region else None,
            "packages": [
                {
                    "id": pkg.id,
                    "name": pkg.name,
                    "slug": pkg.slug,
                    "description": pkg.description,
                    "price": float(pkg.price) if pkg.price else None,
                    "duration_days": pkg.duration_days,
                    "image_id": pkg.image_id,
                    "is_active": pkg.is_active,
                    "price_charts": [
                        {
                            "id": pc.id,
                            "title": pc.title,
                            "start_date": pc.start_date.isoformat() if pc.start_date else None,
                            "end_date": pc.end_date.isoformat() if pc.end_date else None,
                            "price": float(pc.price) if pc.price else 0,
                            "booking_price": float(pc.booking_price) if pc.booking_price is not None else float(pc.price) if pc.price else 0,
                            "notes": pc.notes,
                            "is_active": pc.is_active,
                        } for pc in pkg.price_charts if pc.is_active
                    ] if hasattr(pkg, 'price_charts') and pkg.price_charts else [],
                }
                for pkg in country.packages if pkg.is_active
            ],
            "group_trips": [
                {
                    "id": trip.id,
                    "name": trip.name,
                    "slug": trip.slug,
                    "description": trip.description,
                    "price": float(trip.price) if trip.price else None,
                    "duration_days": trip.duration_days,
                    "max_participants": trip.max_participants,
                    "min_participants": trip.min_participants,
                    "image_id": trip.image_id,
                    "is_active": trip.is_active,
                    "price_charts": [
                        {
                            "id": pc.id,
                            "title": pc.title,
                            "start_date": pc.start_date.isoformat() if pc.start_date else None,
                            "end_date": pc.end_date.isoformat() if pc.end_date else None,
                            "price": float(pc.price) if pc.price else 0,
                            "booking_price": float(pc.booking_price) if pc.booking_price is not None else float(pc.price) if pc.price else 0,
                            "notes": pc.notes,
                            "is_active": pc.is_active,
                        } for pc in trip.price_charts if pc.is_active
                    ] if hasattr(trip, 'price_charts') and trip.price_charts else [],
                    "departures": [
                        {
                            "id": dep.id,
                            "start_date": dep.start_date.isoformat() if dep.start_date else None,
                            "end_date": dep.end_date.isoformat() if dep.end_date else None,
                            "available_slots": dep.available_slots,
                            "booked_slots": dep.booked_slots,
                            "is_active": dep.is_active,
                        }
                        for dep in trip.departures if dep.is_active
                    ] if hasattr(trip, 'departures') else [],
                }
                for trip in country.group_trips if trip.is_active
            ],
            "attractions": [
                {
                    "id": attr.id,
                    "name": attr.name,
                    "slug": attr.slug,
                    "summary": attr.summary,
                    "description": attr.description,
                    "city": attr.city,
                    "image_id": attr.image_id,
                    "cover_image": attr.cover_image or _cloudflare_image_url(attr.image_id),
                    "is_active": attr.is_active,
                }
                for attr in country.attractions if attr.is_active
            ],
            "accommodations": [
                {
                    "id": acc.id,
                    "name": acc.name,
                    "description": acc.description,
                    "image_id": acc.image_id,
                    "is_active": acc.is_active,
                }
                for acc in country.accommodations if acc.is_active
            ],
            "hotels": [
                {
                    "id": hotel.id,
                    "name": hotel.name,
                    "summary": hotel.summary,
                    "description": hotel.description,
                    "stars": hotel.stars,
                    "address": hotel.address,
                    "city": hotel.city,
                    "price_category": hotel.price_category,
                    "amenities": [
                        AmenityResponse.model_validate(amenity).model_dump()
                        for amenity in getattr(hotel, "amenities", [])
                        if getattr(amenity, "is_active", True)
                    ],
                    "image_id": hotel.image_id,
                    "cover_image": _get_hotel_cover_image(hotel),
                    "slug": hotel.slug,
                    "is_active": hotel.is_active,
                    "price_charts": [
                        {
                            "id": pc.id,
                            "title": pc.title,
                            "start_date": pc.start_date.isoformat() if pc.start_date else None,
                            "end_date": pc.end_date.isoformat() if pc.end_date else None,
                            "price": float(pc.price) if pc.price else 0,
                            "booking_price": float(pc.booking_price) if pc.booking_price is not None else float(pc.price) if pc.price else 0,
                            "notes": pc.notes,
                            "is_active": pc.is_active,
                        } for pc in hotel.price_charts if pc.is_active
                    ] if hasattr(hotel, 'price_charts') and hotel.price_charts else [],
                }
                for hotel in country.hotels if hotel.is_active
            ],

            "activities": [
                {
                    "id": activity.id,
                    "name": activity.name,
                    "slug": activity.slug,
                    "summary": activity.summary,
                    "description": activity.description,
                    "image_id": _resolve_media_asset_url(activity.cover_image) if hasattr(activity, 'cover_image') and activity.cover_image else None,
                    "is_active": activity.is_active,
                    "is_featured": activity.is_featured,
                }
                for activity in country.activities if activity.is_active
            ],
            "visit_info": {
                "id": country.visit_info.id,
                "country_id": country.visit_info.country_id,
                "monthly_ratings": country.visit_info.monthly_ratings,
                "general_notes": country.visit_info.general_notes,
                "created_at": country.visit_info.created_at.isoformat() if hasattr(country.visit_info, 'created_at') else None,
                "updated_at": country.visit_info.updated_at.isoformat() if hasattr(country.visit_info, 'updated_at') else None,
            } if country.visit_info else None,
            "media_assets": [
                {
                    "id": asset.id,
                    "filename": asset.filename,
                    "file_path": asset.file_path,
                    "storage_key": asset.storage_key,
                    "content_type": asset.content_type,
                    "url": _resolve_media_asset_url(asset),
                    "title": asset.title,
                    "alt_text": asset.alt_text,
                }
                for asset in getattr(country, "media_assets", []) if asset.is_active
            ],
        }
        
        return country_dict

    def get_countries_with_details(self, db: Session, skip: int = 0, limit: int = 100, is_favorite: Optional[bool] = None) -> List[dict]:
        """
        Retrieve all countries with detailed related data for trending destinations.
        """
        from sqlalchemy.orm import selectinload
        from sqlalchemy import desc
        from app.models.package import Package
        from app.models.group_trip import GroupTrip, GroupTripDeparture
        from app.models.hotel import Hotel
        from app.models.activity import Activity


        query = db.query(Country).options(
            selectinload(Country.region),
            selectinload(Country.packages),
            selectinload(Country.group_trips).selectinload(GroupTrip.departures),
            selectinload(Country.attractions),
            selectinload(Country.accommodations),
            selectinload(Country.hotels).selectinload(Hotel.amenities),
            selectinload(Country.activities).selectinload(Activity.cover_image),
            selectinload(Country.visit_info)
        ).filter(Country.is_active == True)
        
        if is_favorite is not None:
            query = query.filter(Country.is_favorite == is_favorite)
            
        countries = query.order_by(desc(Country.is_favorite), Country.name).offset(skip).limit(limit).all()

        result = []
        for country in countries:
            country_dict = {
                "id": country.id,
                "name": country.name,
                "description": country.description,
                "summary": country.summary,
                "slug": country.slug,
                "region_id": country.region_id,
                "image_id": country.image_id,
                "faqs": country.faqs,
                "highlights": country.highlights,
                "category_intros": country.category_intros,
                "is_active": country.is_active,

                "is_favorite": country.is_favorite,
                "created_at": country.created_at.isoformat() if country.created_at else None,
                "updated_at": country.updated_at.isoformat() if country.updated_at else None,
                "region": {
                    "id": country.region.id,
                    "name": country.region.name,
                    "slug": country.region.slug,
                    "description": country.region.description,
                    "image_id": country.region.image_id,
                } if country.region else None,
                "packages": [
                    {
                        "id": pkg.id,
                        "name": pkg.name,
                        "slug": pkg.slug,
                        "description": pkg.description,
                        "summary": pkg.summary,
                        "price": float(pkg.price) if pkg.price else None,
                        "duration_days": pkg.duration_days,
                        "image_id": pkg.image_id,
                        "is_active": pkg.is_active,
                        "is_featured": pkg.is_featured,
                    }
                    for pkg in country.packages if pkg.is_active
                ],
                "group_trips": [
                    {
                        "id": gt.id,
                        "name": gt.name,
                        "slug": gt.slug,
                        "description": gt.description,
                        "price": float(gt.price) if gt.price else None,
                        "duration_days": gt.duration_days,
                        "image_id": gt.image_id,
                        "is_active": gt.is_active,
                        "max_participants": gt.max_participants,
                        "min_participants": gt.min_participants,
                        "departures": [
                            {
                                "id": dep.id,
                                "start_date": dep.start_date.isoformat() if dep.start_date else None,
                                "end_date": dep.end_date.isoformat() if dep.end_date else None,
                                "price": float(dep.price) if dep.price else None,
                                "available_slots": dep.available_slots,
                                "is_active": dep.is_active,
                            }
                            for dep in gt.departures if dep.is_active
                        ]
                    }
                    for gt in country.group_trips if gt.is_active
                ],
                "attractions": [
                    {
                        "id": attr.id,
                        "name": attr.name,
                        "slug": attr.slug,
                        "description": attr.description,
                        "city": attr.city,
                        "image_id": attr.image_id,
                        "cover_image": attr.cover_image or _cloudflare_image_url(attr.image_id),
                        "is_active": attr.is_active,
                    }
                    for attr in country.attractions if attr.is_active
                ],
                "accommodations": [
                    {
                        "id": acc.id,
                        "name": acc.name,
                        "slug": acc.slug,
                        "description": acc.description,

                        "is_active": acc.is_active,
                        "address": acc.address,
                        "stars": acc.stars,
                        "price_per_night": float(acc.price_per_night) if acc.price_per_night else None,
                        "amenities": acc.amenities,
                    }
                    for acc in country.accommodations if acc.is_active
                ],
                "activities": [
                    {
                        "id": activity.id,
                        "name": activity.name,
                        "slug": activity.slug,
                        "summary": activity.summary,
                        "description": activity.description,
                        "image_id": _resolve_media_asset_url(activity.cover_image) if hasattr(activity, 'cover_image') and activity.cover_image else None,
                        "is_active": activity.is_active,
                        "is_featured": activity.is_featured,
                    }
                    for activity in country.activities if activity.is_active
                ],
                "hotels": [
                    {
                        "id": hotel.id,
                        "name": hotel.name,
                        "summary": hotel.summary,
                        "description": hotel.description,
                        "stars": hotel.stars,
                        "address": hotel.address,
                        "city": hotel.city,
                        "price_category": hotel.price_category,
                        "amenities": [
                            AmenityResponse.model_validate(amenity).model_dump()
                            for amenity in getattr(hotel, "amenities", [])
                            if getattr(amenity, "is_active", True)
                        ],
                        "image_id": hotel.image_id,
                        "cover_image": _get_hotel_cover_image(hotel),
                        "slug": hotel.slug,
                        "is_active": hotel.is_active,
                    }
                    for hotel in country.hotels if hotel.is_active
                ],
                "visit_info": {
                    "id": country.visit_info.id,
                    "country_id": country.visit_info.country_id,
                    "monthly_ratings": country.visit_info.monthly_ratings,
                    "general_notes": country.visit_info.general_notes,
                    "created_at": country.visit_info.created_at.isoformat() if hasattr(country.visit_info, 'created_at') else None,
                    "updated_at": country.visit_info.updated_at.isoformat() if hasattr(country.visit_info, 'updated_at') else None,
                } if country.visit_info else None,
            }
            result.append(country_dict)

        return result

    def create_country(self, db: Session, country_create: CountryCreate) -> Country:
        """
        Create a new country.
        """
        slug = create_slug(country_create.name)
        # Ensure slug is unique
        slug = ensure_unique_slug(db, Country, slug)
        
        db_country = Country(
            name=country_create.name,
            description=country_create.description,
            summary=country_create.summary,
            region_id=country_create.region_id,
            slug=slug,
            faqs=country_create.faqs,
            highlights=country_create.highlights,
            category_intros=country_create.category_intros,
            is_favorite=country_create.is_favorite,

        )
        db.add(db_country)
        
        # Handle media assets
        if country_create.media_asset_ids:
            from app.models.media import MediaAsset
            media_assets = db.query(MediaAsset).filter(MediaAsset.id.in_(country_create.media_asset_ids)).all()
            db_country.media_assets = media_assets
            
        db.commit()
        db.refresh(db_country)
        return db_country
    
    def update_country(self, db: Session, country_id: int, country_update: CountryUpdate) -> Optional[Country]:
        """
        Update an existing country.
        """
        db_country = db.query(Country).filter(Country.id == country_id).first()
        if not db_country:
            return None
        
        update_data = country_update.model_dump(exclude_unset=True)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, Country, db_country.slug, country_id
        )
        
        for key, value in update_data.items():
            if key == "media_asset_ids":
                from app.models.media import MediaAsset
                if value is not None:
                    media_assets = db.query(MediaAsset).filter(MediaAsset.id.in_(value)).all()
                    db_country.media_assets = media_assets
                else:
                    db_country.media_assets = []
            elif key == "is_favorite":
                db_country.is_favorite = value
            else:
                setattr(db_country, key, value)
        
        db.commit()
        db.refresh(db_country)
        return db_country
    
    def delete_country(self, db: Session, country_id: int) -> bool:
        """
        Soft delete a country by setting is_active to False.
        """
        db_country = db.query(Country).filter(Country.id == country_id).first()
        if not db_country:
            return False
        
        db_country.is_active = False
        db.commit()
        return True

country_service = CountryService()
