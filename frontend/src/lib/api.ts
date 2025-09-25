import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// API base URL - connect to the FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1';

// API client for making requests
export const apiClient = {
  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Promise<T> {
    // Prevent duplicate /api/v1 path segments
    const normalizedEndpoint = endpoint.startsWith('/api/v1') 
      ? endpoint.replace(/^\/api\/v1/, '') 
      : endpoint;
    
    // Ensure we don't have double slashes between base URL and endpoint
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const endpointPath = normalizedEndpoint.startsWith('/') ? normalizedEndpoint : `/${normalizedEndpoint}`;
    const url = `${baseUrl}${endpointPath}`;
    
    // Debug logging
    console.log(`API Request: ${method} ${url}`, data);
    
    const headers: HeadersInit = {};
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    // Handle FormData separately from JSON data
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData (browser will set it with boundary)
      config.body = data;
    } else if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        // Format FastAPI validation errors for better readability
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Format FastAPI validation errors
            const validationErrors = errorData.detail.map((err: any) => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return JSON.stringify(err);
            });
            errorMessage = validationErrors.join('\n');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse JSON response
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  },
  
  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, 'GET') as Promise<T>;
  },
  
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request(endpoint, 'POST', data) as Promise<T>;
  },
  
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request(endpoint, 'PUT', data) as Promise<T>;
  },
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, 'DELETE') as Promise<T>;
  },
};

// API endpoints based on the FastAPI backend structure
export const endpoints = {
  // Regions
  regions: {
    list: () => '/regions/',
    detail: (id: number) => `/regions/${id}`,
    bySlug: (slug: string) => `/regions/slug/${slug}`,
    withCountries: () => '/regions/with-countries',
    detailWithCountries: (id: number) => `/regions/${id}/with-countries`,
    bySlugWithCountries: (slug: string) => `/regions/slug/${slug}/with-countries`,
  },
  
  // Cloudflare Images
  cloudflareImages: {
    directUpload: () => '/cloudflare/images/direct-upload',
    upload: () => '/cloudflare/images/upload',
    uploadAndCreateMedia: () => '/cloudflare/images/upload-and-create-media',
    get: (id: string) => `/cloudflare/images/${id}`,
    list: () => '/cloudflare/images',
    delete: (id: string) => `/cloudflare/images/${id}`,
    variants: () => '/cloudflare/images/variants',
    variant: (id: string) => `/cloudflare/images/variants/${id}`,
    signedUrl: () => '/cloudflare/images/signed-url',
  },
  
  // Countries
  countries: {
    list: () => '/countries/',
    byId: (id: number) => `/countries/${id}`,
    bySlug: (slug: string) => `/countries/slug/${slug}`,
    bySlugWithDetails: (slug: string) => `/countries/slug/${slug}/details`,
    byRegion: (regionId: number) => `/countries/region/${regionId}`,
    visitInfo: (countryId: number) => `/countries/${countryId}/visit-info`,
    updateVisitInfo: (countryId: number) => `/countries/${countryId}/visit-info`,
  },
  
  // Packages
  packages: {
    list: () => '/packages/',
    featured: () => '/packages/featured',
    detail: (id: number) => `/packages/${id}`,
    bySlug: (slug: string) => `/packages/slug/${slug}`,
    byCountry: (countryId: number) => `/packages/?country_id=${countryId}`,
    byHolidayType: (holidayTypeId: number) => `/packages/?holiday_type_id=${holidayTypeId}`,
    coverImage: (id: number) => `/packages/${id}/cover-image`,
  },
  
  // Hotels
  hotels: {
    list: () => '/hotels/',
    detail: (id: number) => `/hotels/${id}`,
    bySlug: (slug: string) => `/hotels/slug/${slug}`,
  },

  // Group Trips
  groupTrips: {
    list: () => '/group-trips/',
    byId: (id: number) => `/group-trips/${id}`,
    bySlug: (slug: string) => `/group-trips/slug/${slug}`,
    detailsBySlug: (slug: string) => `/group-trips/details/${slug}`,
    byCountry: (countryId: number) => `/group-trips/?country_id=${countryId}`,
    byHolidayType: (holidayTypeId: number) => `/group-trips/?holiday_type_id=${holidayTypeId}`,
    departures: (groupTripId: number) => `/group-trips/${groupTripId}/departures`,
  },
  
  
  // Accommodations
  accommodations: {
    list: () => '/accommodations/',
    detail: (id: number) => `/accommodations/${id}`,
    bySlug: (slug: string) => `/accommodations/slug/${slug}`,
    byCountry: (countryId: number) => `/accommodations/?country_id=${countryId}`,
  },
  
  // Activities
  activities: {
    list: () => '/activities/',
    detail: (id: number) => `/activities/${id}`,
    bySlug: (slug: string) => `/activities/slug/${slug}`,
    byCountry: (countryId: number) => `/activities/?country_id=${countryId}`,
    create: () => '/activities/',
    update: (id: number) => `/activities/${id}`,
    delete: (id: number) => `/activities/${id}`,
  },
  
  // Attractions
  attractions: {
    list: () => '/attractions/',
    detail: (id: number) => `/attractions/${id}`,
    bySlug: (slug: string) => `/attractions/slug/${slug}`,
    byCountry: (countryId: number) => `/attractions/?country_id=${countryId}`,
    trips: (id: number) => `/attractions/${id}/trips`,
    tripsBySlug: (slug: string) => `/attractions/slug/${slug}/trips`,
  },
  
  // Holiday Types
  holidayTypes: {
    list: () => '/holiday-types/',
    detail: (id: number) => `/holiday-types/${id}`,
    bySlug: (slug: string) => `/holiday-types/slug/${slug}`,
    coverImage: (id: number) => `/holiday-types/${id}/cover-image`,
  },
  
  // Reviews
  reviews: {
    list: () => '/reviews/',
  },

  // Blog
  blog: {
    list: () => '/blog/',
    detail: (id: number) => `/blog/${id}`,
    bySlug: (slug: string) => `/blog/slug/${slug}`,
    byTag: (tag: string) => `/blog/?tag=${tag}`,
  },
  
  // Newsletter
  newsletter: {
    subscribe: () => '/newsletter/subscribe',
    list: () => '/newsletter/',
  },

  // Search
  search: {
    query: (q: string) => `/search/?q=${encodeURIComponent(q)}`,
    filter: (params: Record<string, string>) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      return `/search/?${searchParams.toString()}`;
    },
  },
  
  // Media
  media: {
    list: () => '/media/',
    detail: (id: string) => `/media/${id}`,
    upload: () => '/media/upload/',
  },
  
  // Authentication
  auth: {
    login: () => '/auth/login',
    refreshToken: () => '/auth/refresh',
  },
  
  // Users
  users: {
    list: () => '/users/',
    detail: (id: number) => `/users/${id}`,
    me: () => '/users/me',
  },
};

// Type definitions for API responses
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

// Authentication types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
