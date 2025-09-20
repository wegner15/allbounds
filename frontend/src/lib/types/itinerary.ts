import type { ActivityResponse } from './api';

export type EntityType = 'package' | 'group_trip';

export interface Hotel {
  id: number;
  name: string;
  stars?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface Attraction {
  id: number;
  name: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  duration_minutes?: number;
}

export interface ItineraryActivity {
  id: number;
  itinerary_item_id: number;
  time?: string;
  activity_title: string;
  activity_description?: string;
  location?: string;
  attraction_id?: number;
  attraction?: Attraction;
  duration_hours?: number;
  is_meal: boolean;
  meal_type?: string;
  order_index: number;
  
  // Backward compatibility properties
  title?: string;
  description?: string;
}

export interface ItineraryItem {
  id: number;
  entity_type?: EntityType;
  entity_id?: number;
  day_number: number;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hotel_ids: number[];
  attraction_ids: number[];
  linked_activity_ids: number[];
  accommodation_notes?: string;
  custom_activities: ItineraryActivity[];
  hotels: Hotel[];
  attractions: Attraction[];
  linked_activities: ActivityResponse[];
  
  // Backward compatibility properties
  activities?: ItineraryActivity[];
  accommodation_hotel?: Hotel;
  accommodation?: {
    type: 'hotel' | 'notes';
    hotel?: Hotel;
    notes?: string;
  };
}

export interface ItineraryResponse {
  entity_type: EntityType;
  entity_id: number;
  total_days: number;
  items: ItineraryItem[];
}

export interface ItineraryItemCreate {
  entity_type: EntityType;
  entity_id: number;
  day_number: number;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hotel_ids: number[];
  attraction_ids: number[];
  linked_activity_ids: number[];
  accommodation_notes?: string;
  custom_activities: ItineraryActivityCreate[];
}

export interface ItineraryActivityCreate {
  time?: string;
  activity_title: string;
  activity_description?: string;
  location?: string;
  attraction_id?: number;
  duration_hours?: number;
  is_meal: boolean;
  meal_type?: string;
  order_index: number;
}

export interface ItineraryItemUpdate {
  day_number?: number;
  date?: string;
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hotel_ids?: number[];
  attraction_ids?: number[];
  linked_activity_ids?: number[];
  accommodation_notes?: string;
}

export interface ItineraryActivityUpdate {
  time?: string;
  activity_title?: string;
  activity_description?: string;
  location?: string;
  attraction_id?: number;
  duration_hours?: number;
  is_meal?: boolean;
  meal_type?: string;
  order_index?: number;
}
