// API response types based on the backend schemas

// Base types
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// Region types
export interface Region extends BaseModel {
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
}

// Country in region type (simplified for embedding in RegionWithCountries)
export interface CountryInRegion {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

// Region with countries type
export interface RegionWithCountries extends BaseModel {
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
  countries: CountryInRegion[];
}

// Country types
export interface Country extends BaseModel {
  name: string;
  description: string;
  slug: string;
  region_id: number;
  region: Region;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  capital?: string;
  currency?: string;
  language?: string;
  population?: number;
  timezone?: string;
}

// Country Visit Info types
export interface MonthlyVisitRating {
  month: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'discouraged';
  notes?: string;
}

export interface CountryVisitInfo extends BaseModel {
  country_id: number;
  monthly_ratings: MonthlyVisitRating[];
  general_notes?: string;
}

// Country with destinations details
export interface CountryWithDetails extends Country {
  packages: Package[];
  group_trips: GroupTripWithDepartures[];
  attractions: Attraction[];
  accommodations: Accommodation[];
  hotels: Hotel[];
  visit_info?: CountryVisitInfo;
}

// Group trip with departures for country details
export interface GroupTripWithDepartures {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  max_participants: number;
  min_participants: number;
  image_id?: string;
  is_active: boolean;
  departures: GroupTripDeparture[];
}

// Activity types
export interface Activity extends BaseModel {
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
  countries: Country[];
}

export interface ActivityResponse extends Activity {
  media_assets: MediaAsset[];
  cover_image_id?: number;
}

export interface ActivityCreate {
  name: string;
  description?: string;
  is_active?: boolean;
  cover_image_id?: number | null;
  media_asset_ids?: number[];
}

export interface ActivityUpdate extends Partial<ActivityCreate> {}

// Attraction types
export interface Attraction extends BaseModel {
  name: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  image_url?: string;
  image_id?: string;
  cover_image?: string;
  is_active: boolean;
  location?: string;
  entry_fee?: number;
  opening_hours?: string;
}

// Accommodation types
export interface Accommodation extends BaseModel {
  name: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  address?: string;
  stars?: number;
  price_per_night?: number;
  amenities?: string[];
}

// Gallery image type
export interface GalleryImage {
  id: number;
  filename: string;
  alt_text?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  file_path: string;
}

// Hotel types
export interface Hotel extends BaseModel {
  name: string;
  summary?: string;
  description: string;
  slug: string;
  country_id?: number;
  country?: Country;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  address?: string;
  city?: string;
  stars?: number;
  price_category?: string;
  amenities?: string[];
}

// Hotel with gallery
export interface HotelWithGallery extends Hotel {
  cover_image?: string;
  gallery_images: GalleryImage[];
  check_in_time?: string;
  check_out_time?: string;
}

// Holiday Type types
export interface HolidayType extends BaseModel {
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
}

// Package types
export interface Package extends BaseModel {
  name: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  duration_days: number;
  price: number;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  holiday_types: HolidayType[];
  gallery_images?: MediaAsset[];
  rating?: number;
  review_count?: number;
}

// Package with gallery
export interface PackageWithGallery extends Omit<Package, 'gallery_images'> {
  cover_image?: string;
  gallery_images: GalleryImage[];
}

export interface PackageItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: {
    id: string;
    time?: string;
    title: string;
    description?: string;
    location?: string;
    duration?: string;
    image?: string;
  }[];
  accommodation?: {
    id: string;
    name: string;
    description?: string;
    stars?: number;
    image?: string;
    link?: string;
  };
}

// Group Trip types
export interface GroupTrip extends BaseModel {
  name: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  duration_days: number;
  price: number;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: PackageItineraryDay[];
  holiday_types: HolidayType[];
  gallery_images?: MediaAsset[];
  rating?: number;
  review_count?: number;
  max_participants?: number;
  min_participants?: number;
  departures: GroupTripDeparture[];
}

// Group Trip with gallery
export interface GroupTripWithGallery extends Omit<GroupTrip, 'gallery_images'> {
  cover_image?: string;
  gallery_images: GalleryImage[];
}

export interface GroupTripDeparture {
  id: number;
  group_trip_id: number;
  start_date: string;
  end_date: string;
  price: number;
  available_spots: number;
  is_active: boolean;
}

// Blog types
export interface BlogPost extends BaseModel {
  title: string;
  content: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  author_id?: number;
  author?: User;
  published_at?: string;
  tags: Tag[];
}

export interface Tag extends BaseModel {
  name: string;
  slug: string;
}

// Media types
export interface Media {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset extends BaseModel {
  filename: string;
  original_filename?: string;
  file_path: string;
  storage_key?: string;
  file_size: number;
  content_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  title?: string;
  caption?: string;
  is_public?: boolean;
  is_active: boolean;
  entity_type?: string;
  entity_id?: number;
  created_by_id: number;
  url?: string;
}

// User types
export interface User extends BaseModel {
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
}

// Review types
export interface Review extends BaseModel {
  content: string;
  rating: number;
  author_name: string;
  author_email: string;
  is_approved: boolean;
  entity_type: 'package' | 'group_trip' | 'accommodation';
  entity_id: number;
}

// Search types
export interface SearchResult {
  id: number;
  type: 'country' | 'region' | 'package' | 'group_trip' | 'accommodation' | 'attraction' | 'activity' | 'blog_post' | 'holiday_type';
  title: string;
  description: string;
  slug: string;
  image_url?: string;
  url: string;
  highlights?: string[];
  score: number;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// Error response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
