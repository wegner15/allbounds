import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';

export interface AttractionTripsResponse {
  attraction: {
    id: number;
    name: string;
    slug: string;
    summary?: string;
    description?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    duration_minutes?: number;
    price?: number;
    opening_hours?: string;
    image_id?: string;
    cover_image?: string;
    gallery_images?: Array<{
      id: number;
      file_path: string;
      alt_text?: string;
      caption?: string;
    }>;
    country: {
      id: number;
      name: string;
      slug: string;
    };
  };
  packages: Array<{
    id: number;
    name: string;
    slug: string;
    summary?: string;
    price?: number;
    duration_days?: number;
    cover_image?: string;
    country: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  group_trips: Array<{
    id: number;
    name: string;
    slug: string;
    summary?: string;
    price?: number;
    duration_days?: number;
    max_participants?: number;
    cover_image?: string;
    country: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  total_packages: number;
  total_group_trips: number;
}

export const useAttractionTrips = (slug: string) => {
  return useQuery({
    queryKey: ['attraction-trips', slug],
    queryFn: () => apiClient.get<AttractionTripsResponse>(endpoints.attractions.tripsBySlug(slug)),
    enabled: !!slug,
  });
};

export const useAttractionTripsById = (id: number) => {
  return useQuery({
    queryKey: ['attraction-trips', id],
    queryFn: () => apiClient.get<AttractionTripsResponse>(endpoints.attractions.trips(id)),
    enabled: !!id,
  });
};
