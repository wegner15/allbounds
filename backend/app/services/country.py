from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.country import Country
from app.schemas.country import CountryCreate, CountryUpdate
from app.utils.slug import create_slug

class CountryService:
    def get_countries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve all countries with pagination.
        """
        return db.query(Country).filter(Country.is_active == True).offset(skip).limit(limit).all()
    
    def get_countries_by_region(self, db: Session, region_id: int, skip: int = 0, limit: int = 100) -> List[Country]:
        """
        Retrieve all countries for a specific region with pagination.
        """
        return db.query(Country).filter(
            Country.region_id == region_id,
            Country.is_active == True
        ).offset(skip).limit(limit).all()
    
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
        from sqlalchemy.orm import joinedload
        from app.models.group_trip import GroupTrip, GroupTripDeparture
        
        country = db.query(Country).options(
            joinedload(Country.region),
            joinedload(Country.packages),
            joinedload(Country.group_trips).joinedload(GroupTrip.departures),
            joinedload(Country.attractions),
            joinedload(Country.accommodations),
            joinedload(Country.hotels),
            joinedload(Country.visit_info)
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
                    "amenities": hotel.amenities,
                    "image_id": hotel.image_id,
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
        
        return country_dict
    
    def create_country(self, db: Session, country_create: CountryCreate) -> Country:
        """
        Create a new country.
        """
        slug = create_slug(country_create.name)
        db_country = Country(
            name=country_create.name,
            description=country_create.description,
            region_id=country_create.region_id,
            slug=slug,
        )
        db.add(db_country)
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
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
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
