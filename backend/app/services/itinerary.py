from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.itinerary import ItineraryItem, ItineraryActivity, EntityType
from app.models.hotel import Hotel
from app.models.attraction import Attraction
from app.models.activity import Activity
from app.schemas.itinerary import (
    ItineraryItemCreate, ItineraryItemUpdate, ItineraryActivityCreate, 
    ItineraryActivityUpdate, ItineraryBulkCreate
)


class ItineraryService:
    
    def get_itinerary_by_entity(self, db: Session, entity_type: EntityType, entity_id: int) -> List[ItineraryItem]:
        """Get complete itinerary for a package or group trip."""
        return db.query(ItineraryItem).options(
            joinedload(ItineraryItem.custom_activities).joinedload(ItineraryActivity.attraction),
            joinedload(ItineraryItem.hotels),
            joinedload(ItineraryItem.attractions),
            joinedload(ItineraryItem.linked_activities)
        ).filter(
            and_(
                ItineraryItem.entity_type == entity_type,
                ItineraryItem.entity_id == entity_id
            )
        ).order_by(ItineraryItem.day_number).all()
    
    def get_itinerary_item(self, db: Session, item_id: int) -> Optional[ItineraryItem]:
        """Get a specific itinerary item with activities."""
        return db.query(ItineraryItem).options(
            joinedload(ItineraryItem.custom_activities).joinedload(ItineraryActivity.attraction),
            joinedload(ItineraryItem.hotels),
            joinedload(ItineraryItem.attractions),
            joinedload(ItineraryItem.linked_activities)
        ).filter(ItineraryItem.id == item_id).first()
    
    def create_itinerary_item(self, db: Session, item_data: ItineraryItemCreate) -> Dict[str, Any]:
        """Create a new itinerary item with activities."""
        # Create the itinerary item
        db_item = ItineraryItem(
            entity_type=item_data.entity_type,
            entity_id=item_data.entity_id,
            day_number=item_data.day_number,
            date=item_data.date,
            title=item_data.title,
            description=item_data.description,
            location=item_data.location,
            latitude=item_data.latitude,
            longitude=item_data.longitude,
            accommodation_notes=item_data.accommodation_notes
        )
        db.add(db_item)
        db.flush()  # Get the ID without committing
        
        # Add hotels if provided
        if item_data.hotel_ids:
            hotels = db.query(Hotel).filter(Hotel.id.in_(item_data.hotel_ids)).all()
            db_item.hotels.extend(hotels)
        
        # Add attractions if provided
        if item_data.attraction_ids:
            attractions = db.query(Attraction).filter(Attraction.id.in_(item_data.attraction_ids)).all()
            db_item.attractions.extend(attractions)

        # Add linked activities if provided
        if item_data.linked_activity_ids:
            activities = db.query(Activity).filter(Activity.id.in_(item_data.linked_activity_ids)).all()
            db_item.linked_activities.extend(activities)
        
        # Create custom activities
        for activity_data in item_data.custom_activities:
            db_activity = ItineraryActivity(
                itinerary_item_id=db_item.id,
                time=activity_data.time,
                activity_title=activity_data.activity_title,
                activity_description=activity_data.activity_description,
                location=activity_data.location,
                attraction_id=activity_data.attraction_id,
                duration_hours=activity_data.duration_hours,
                is_meal=activity_data.is_meal,
                meal_type=activity_data.meal_type,
                order_index=activity_data.order_index
            )
            db.add(db_activity)
        
        db.commit()
        db.refresh(db_item)
        
        # Return formatted response instead of raw model
        return self.format_single_item_for_response(db_item)
    
    def update_itinerary_item(self, db: Session, item_id: int, item_data: ItineraryItemUpdate) -> Optional[Dict[str, Any]]:
        """Update an existing itinerary item."""
        db_item = db.query(ItineraryItem).options(
            joinedload(ItineraryItem.hotels),
            joinedload(ItineraryItem.attractions),
            joinedload(ItineraryItem.custom_activities).joinedload(ItineraryActivity.attraction),
            joinedload(ItineraryItem.linked_activities)
        ).filter(ItineraryItem.id == item_id).first()
        
        if not db_item:
            return None
        
        update_data = item_data.model_dump(exclude_unset=True)
        
        # Handle hotel_ids separately
        if 'hotel_ids' in update_data:
            hotel_ids = update_data.pop('hotel_ids')
            if hotel_ids is not None:
                # Clear existing hotels and add new ones
                db_item.hotels.clear()
                if hotel_ids:
                    hotels = db.query(Hotel).filter(Hotel.id.in_(hotel_ids)).all()
                    db_item.hotels.extend(hotels)
        
        # Handle linked_activity_ids separately
        if 'linked_activity_ids' in update_data:
            linked_activity_ids = update_data.pop('linked_activity_ids')
            if linked_activity_ids is not None:
                db_item.linked_activities.clear()
                if linked_activity_ids:
                    activities = db.query(Activity).filter(Activity.id.in_(linked_activity_ids)).all()
                    db_item.linked_activities.extend(activities)

        # Handle attraction_ids separately
        if 'attraction_ids' in update_data:
            attraction_ids = update_data.pop('attraction_ids')
            if attraction_ids is not None:
                # Clear existing attractions and add new ones
                db_item.attractions.clear()
                if attraction_ids:
                    attractions = db.query(Attraction).filter(Attraction.id.in_(attraction_ids)).all()
                    db_item.attractions.extend(attractions)
        
        # Update other fields
        for key, value in update_data.items():
            setattr(db_item, key, value)
        
        db.commit()
        db.refresh(db_item)
        
        # Return formatted response instead of raw model
        return self.format_single_item_for_response(db_item)
    
    def delete_itinerary_item(self, db: Session, item_id: int) -> bool:
        """Delete an itinerary item and all its activities."""
        db_item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
        if not db_item:
            return False
        
        db.delete(db_item)
        db.commit()
        return True
    
    def create_activity(self, db: Session, item_id: int, activity_data: ItineraryActivityCreate) -> Optional[ItineraryActivity]:
        """Add an activity to an itinerary item."""
        # Verify the itinerary item exists
        db_item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
        if not db_item:
            return None
        
        db_activity = ItineraryActivity(
            itinerary_item_id=item_id,
            time=activity_data.time,
            activity_title=activity_data.activity_title,
            activity_description=activity_data.activity_description,
            location=activity_data.location,
            attraction_id=activity_data.attraction_id,
            duration_hours=activity_data.duration_hours,
            is_meal=activity_data.is_meal,
            meal_type=activity_data.meal_type,
            order_index=activity_data.order_index
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity
    
    def update_activity(self, db: Session, activity_id: int, activity_data: ItineraryActivityUpdate) -> Optional[ItineraryActivity]:
        """Update an existing activity."""
        db_activity = db.query(ItineraryActivity).filter(ItineraryActivity.id == activity_id).first()
        if not db_activity:
            return None
        
        update_data = activity_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_activity, key, value)
        
        db.commit()
        db.refresh(db_activity)
        return db_activity
    
    def delete_activity(self, db: Session, activity_id: int) -> bool:
        """Delete an activity."""
        db_activity = db.query(ItineraryActivity).filter(ItineraryActivity.id == activity_id).first()
        if not db_activity:
            return False
        
        db.delete(db_activity)
        db.commit()
        return True
    
    def reorder_activities(self, db: Session, item_id: int, activity_ids: List[int]) -> bool:
        """Reorder activities within an itinerary item."""
        # Get all activities for the item
        activities = db.query(ItineraryActivity).filter(
            ItineraryActivity.itinerary_item_id == item_id
        ).all()
        
        # Create a mapping of activity ID to activity
        activity_map = {activity.id: activity for activity in activities}
        
        # Update order_index for each activity
        for index, activity_id in enumerate(activity_ids):
            if activity_id in activity_map:
                activity_map[activity_id].order_index = index
        
        db.commit()
        return True
    
    def reorder_itinerary_items(self, db: Session, entity_type: EntityType, entity_id: int, item_ids: List[int]) -> bool:
        """Reorder itinerary items by updating day numbers."""
        # Get all items for the entity
        items = db.query(ItineraryItem).filter(
            and_(
                ItineraryItem.entity_type == entity_type,
                ItineraryItem.entity_id == entity_id
            )
        ).all()
        
        # Create a mapping of item ID to item
        item_map = {item.id: item for item in items}
        
        # Update day_number for each item
        for index, item_id in enumerate(item_ids):
            if item_id in item_map:
                item_map[item_id].day_number = index + 1
        
        db.commit()
        return True
    
    def bulk_create_itinerary(self, db: Session, bulk_data: ItineraryBulkCreate) -> List[ItineraryItem]:
        """Create multiple itinerary items at once."""
        created_items = []
        
        for item_data in bulk_data.items:
            # Set entity info
            item_data.entity_type = bulk_data.entity_type
            item_data.entity_id = bulk_data.entity_id
            
            created_item = self.create_itinerary_item(db, item_data)
            created_items.append(created_item)
        
        return created_items
    
    def generate_dates_for_group_trip(self, db: Session, entity_id: int, start_date: date, duration_days: int) -> bool:
        """Generate actual dates for group trip itinerary items based on start date."""
        items = db.query(ItineraryItem).filter(
            and_(
                ItineraryItem.entity_type == EntityType.GROUP_TRIP,
                ItineraryItem.entity_id == entity_id
            )
        ).order_by(ItineraryItem.day_number).all()
        
        for item in items:
            # Calculate the date for this day (day_number is 1-based)
            item_date = start_date + timedelta(days=item.day_number - 1)
            item.date = item_date
        
        db.commit()
        return True
    
    def format_single_item_for_response(self, item: ItineraryItem) -> Dict[str, Any]:
        """Format a single itinerary item for API response."""
        # Format hotels
        hotels = []
        for hotel in item.hotels:
            hotels.append({
                "id": hotel.id,
                "name": hotel.name,
                "stars": hotel.stars,
                "address": hotel.address,
                "city": hotel.city,
                "latitude": hotel.latitude,
                "longitude": hotel.longitude
            })
        
        # Format attractions
        attractions = []
        for attraction in item.attractions:
            attractions.append({
                "id": attraction.id,
                "name": attraction.name,
                "address": attraction.address,
                "city": attraction.city,
                "latitude": attraction.latitude,
                "longitude": attraction.longitude,
                "duration_minutes": attraction.duration_minutes
            })
        
        # Format custom activities
        formatted_custom_activities = []
        for activity in sorted(item.custom_activities, key=lambda x: x.order_index):
            activity_data = {
                "id": activity.id,
                "time": activity.time.strftime("%H:%M") if activity.time else None,
                "activity_title": activity.activity_title,
                "activity_description": activity.activity_description,
                "location": activity.location,
                "duration_hours": float(activity.duration_hours) if activity.duration_hours else None,
                "is_meal": activity.is_meal,
                "meal_type": activity.meal_type,
                "order_index": activity.order_index
            }
            
            # Add attraction details if linked
            if activity.attraction:
                activity_data["attraction"] = {
                    "id": activity.attraction.id,
                    "name": activity.attraction.name,
                    "address": activity.attraction.address,
                    "city": activity.attraction.city
                }
            
            formatted_custom_activities.append(activity_data)
        
        # Format linked activities
        linked_activities = []
        for activity in item.linked_activities:
            linked_activities.append({
                "id": activity.id,
                "name": activity.name,
                "description": activity.description,
                "slug": activity.slug,
                "is_active": activity.is_active,
                "created_at": activity.created_at.isoformat() if activity.created_at else None,
                "updated_at": activity.updated_at.isoformat() if activity.updated_at else None
            })
            
        return {
            "id": item.id,
            "entity_type": item.entity_type.value,
            "entity_id": item.entity_id,
            "day_number": item.day_number,
            "date": item.date.isoformat() if item.date else None,
            "title": item.title,
            "description": item.description,
            "location": item.location,
            "latitude": float(item.latitude) if item.latitude else None,
            "longitude": float(item.longitude) if item.longitude else None,
            "hotel_ids": [hotel.id for hotel in item.hotels],
            "attraction_ids": [attraction.id for attraction in item.attractions],
            "linked_activity_ids": [activity.id for activity in item.linked_activities],
            "hotels": hotels,
            "attractions": attractions,
            "linked_activities": linked_activities,
            "accommodation_notes": item.accommodation_notes,
            "custom_activities": formatted_custom_activities
        }

    def format_itinerary_for_response(self, items: List[ItineraryItem]) -> Dict[str, Any]:
        """Format itinerary items for API response with additional details."""
        formatted_items = []
        
        for item in items:
            formatted_items.append(self.format_single_item_for_response(item))
        
        return {
            "total_days": len(formatted_items),
            "items": formatted_items
        }


itinerary_service = ItineraryService()
