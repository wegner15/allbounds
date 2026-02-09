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
  summary?: string;
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
  image_id?: string;
  is_active: boolean;
  is_featured?: boolean;
}

// Region with countries type
export interface RegionWithCountries extends BaseModel {
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  countries: CountryInRegion[];
}

// Country types
export interface Country extends BaseModel {
  name: string;
  description: string;
  summary?: string;
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
  latitude?: number;
  longitude?: number;
  package_count?: number;
  media_assets?: MediaAsset[];
}

export interface CountryCreate {
  name: string;
  description?: string;
  summary?: string;
  region_id: number;
  image_id?: string;
  media_asset_ids?: number[];
}

export interface CountryUpdate extends Partial<CountryCreate> {
  is_active?: boolean;
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
  attractions: (Attraction & { cover_image?: string | null })[];
  accommodations: Accommodation[];
  hotels: (Hotel & { cover_image?: string | null })[];
  activities: Activity[];
  visit_info?: CountryVisitInfo;
  media_assets: MediaAsset[];
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
  itinerary?: string | PackageItineraryDay[] | null;
  departures: GroupTripDeparture[];
}

// Activity types
export interface Activity extends BaseModel {
  name: string;
  description: string;
  summary?: string;
  slug: string;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  is_featured: boolean;
  countries: Country[];
  cover_image?: MediaAsset;
}

export interface ActivityResponse extends Activity {
  media_assets: MediaAsset[];
  cover_image_id?: number;
  cover_image?: MediaAsset;
}

export interface ActivityCreate {
  name: string;
  description?: string;
  summary?: string;
  is_active?: boolean;
  is_featured?: boolean;
  cover_image_id?: number | null;
  media_asset_ids?: number[];
  country_ids?: number[];
}

export type ActivityUpdate = Partial<ActivityCreate>;

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
  latitude?: number;
  longitude?: number;
  city?: string;
  summary?: string;
}

// Accommodation types
// Hotel Type
export interface HotelType extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

// Accommodation types (keeping existing)
export interface Accommodation extends BaseModel {
  name: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  hotel_type_id?: number;
  hotel_type?: HotelType;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  address?: string;
  stars?: number;
  price_per_night?: number;
  amenities?: string[];
  city?: string;
  price_category?: string;
  check_in_time?: string;
  check_out_time?: string;
  latitude?: number;
  longitude?: number;
}

// Hotel alias if needed, or update if it exists.
// Based on previous search, I didn't see distinct `interface Hotel` but it was usage in `CountryWithDetails`.
// Let's assume Accommodation is the main one or aliases exist.
// Actually, `CountryWithDetails` uses `Hotel`.
// Hotel alias removed in favor of explicit interface below


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

// Amenity types
export interface Amenity extends BaseModel {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  is_active: boolean;
}

export interface AmenityCreate {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export type AmenityUpdate = Partial<AmenityCreate> & {
  is_active?: boolean;
};

// Hotel types
// Hotel types
export interface Hotel extends BaseModel {
  name: string;
  summary?: string;
  description: string;
  slug: string;
  country_id?: number;
  country?: Country;
  hotel_type_id?: number;
  hotel_type?: HotelType;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  address?: string;
  city?: string;
  stars?: number;
  price_category?: string;
  amenities?: Amenity[];
  amenity_ids?: number[];
  check_in_time?: string;
  check_out_time?: string;
  latitude?: number;
  longitude?: number;
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
  icon?: string;
  is_active: boolean;
  is_featured?: boolean;
}

// Package types
export interface Package extends BaseModel {
  name: string;
  description: string;
  summary?: string;
  slug: string;
  country_id: number;
  country: Country;
  duration_days: number;
  price: number;
  image_url?: string;
  image_id?: string;
  is_active: boolean;
  is_featured: boolean;
  is_deal: boolean;
  inclusions?: InclusionExclusionItem[];
  exclusions?: InclusionExclusionItem[];
  itinerary?: PackageItineraryDay[];
  holiday_types: HolidayType[];
  gallery_images?: MediaAsset[];
  blog_post_ids?: number[];
  blog_posts?: BlogPost[];
  rating?: number;
  review_count?: number;
}

// Package with gallery
export interface PackageWithGallery extends Omit<Package, 'gallery_images'> {
  cover_image?: string;
  gallery_images: GalleryImage[];
}

// Comprehensive Package Detail types for tour page redesign
export interface CountrySummary {
  id: number;
  name: string;
  slug: string;
  image_id?: string;
}

export interface HolidayTypeSummary {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface MediaAssetSummary {
  id: number;
  image_id?: string;
  storage_key?: string;
  file_path?: string;
  filename?: string;
  title?: string;
  caption?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  order_index?: number;
}

export interface AmenitySummary {
  id: number;
  name: string;
  icon?: string;
  category?: string;
}

export interface HotelSummary {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  city?: string;
  stars?: number;
  image_id?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  amenities: AmenitySummary[];
}

export interface AttractionSummary {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  city?: string;
  image_id?: string;
  latitude?: number;
  longitude?: number;
}

export interface ItineraryActivityDetail {
  id: number;
  time?: string;
  activity_title: string;
  activity_description?: string;
  location?: string;
  duration_hours?: number;
  is_meal: boolean;
  meal_type?: string;
  order_index: number;
}

export interface ActivitySummary {
  id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
}

export interface ItineraryItemDetail {
  id: number;
  day_number: number;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  accommodation_notes?: string;
  hotels: HotelSummary[];
  attractions: AttractionSummary[];
  custom_activities: ItineraryActivityDetail[];
  linked_activities: ActivitySummary[];
}

export interface InclusionDetail {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface ExclusionDetail {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface ReviewDetail {
  id: number;
  title?: string;
  content: string;
  rating: number;
  reviewer_name: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface PriceChartDetail {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  is_active: boolean;
}

export interface PackageDetailResponse {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  duration_days?: number;
  price?: number;
  image_id?: string;
  is_active: boolean;
  is_featured: boolean;
  is_deal: boolean;
  created_at: string;
  updated_at: string;
  country: CountrySummary;
  holiday_types: HolidayTypeSummary[];
  media_assets: MediaAssetSummary[];
  itinerary_items: ItineraryItemDetail[];
  inclusion_items: InclusionDetail[];
  exclusion_items: ExclusionDetail[];
  hotels: HotelSummary[];
  attractions: AttractionSummary[];
  reviews: ReviewDetail[];
  price_charts: PriceChartDetail[];
  blog_posts: BlogPost[];
}

export interface InclusionExclusionItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
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
  summary?: string;
  description: string;
  slug: string;
  country_id: number;
  country: Country;
  duration_days: number;
  price: number;
  image_url?: string;
  image_id?: string;
  package_id?: number;
  is_active: boolean;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: string | PackageItineraryDay[] | null;
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
  cover_image_id?: string;
  is_active: boolean;
  is_featured: boolean;
  author_id?: number;
  author?: User;
  published_at?: string;
  tags: Tag[];
  package_ids?: number[];
  packages?: Package[];
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
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string;
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

// Booking types
export interface Traveler {
  id?: number;
  full_name: string;
  traveler_type: 'adult' | 'child';
  age?: number;
}

export interface Booking extends BaseModel {
  booking_type: 'package' | 'group_trip';
  entity_slug: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  country_of_origin?: string;
  number_of_adults: number;
  number_of_children: number;
  travelers: Traveler[];
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  source: string;
}

export interface BookingCreate {
  booking_type: 'package' | 'group_trip' | 'hotel';
  entity_id: number;
  entity_slug: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  country_of_origin?: string;
  number_of_adults: number;
  number_of_children: number;
  travelers: Traveler[];
  special_requests?: string;
  source: string;
  departure_id?: number;
}

// Inquiry types
export interface Inquiry extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  country_of_origin?: string;
  subject: string;
  message: string;
  source: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  is_read: boolean;
}

export interface InquiryCreate {
  name: string;
  email: string;
  phone?: string;
  country_of_origin?: string;
  subject: string;
  message: string;
  source: string;
}

// Stats types
export interface RecentActivityItem {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  user_name: string;
  created_at: string;
}

export interface RecentBookingItem {
  id: number;
  booking_type: string;
  contact_name: string;
  contact_email: string;
  status: string;
  created_at: string;
}

export interface Stats {
  destinations: number;
  holiday_types: number;
  packages: number;
  group_trips: number;
  activities: number;
  hotels: number;
  attractions: number;
  package_bookings: number;
  group_trip_bookings: number;
  inquiries: number;
  recent_activity: RecentActivityItem[];
  recent_bookings: RecentBookingItem[];
}
