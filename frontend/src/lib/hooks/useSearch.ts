import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

// Meilisearch response types
export interface MeilisearchHit {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  slug: string;
  is_active?: boolean;
  image_id?: string;
  image_url?: string;
  cover_image_url?: string;
  cover_image_id?: string; // Used by blog posts
  country_id?: number;
  country_name?: string;
  country_slug?: string;
  country?: { id?: number; name?: string; slug?: string; image_id?: string } | null;
  countries?: { id?: number; name?: string; slug?: string; image_id?: string }[] | null;
  region_id?: number;
  price?: number;
  duration_days?: number;
  city?: string;
  address?: string;
  duration_minutes?: number;
  opening_hours?: string;
  [key: string]: any;
}

export interface MeilisearchResults {
  hits: MeilisearchHit[];
  processing_time_ms: number;
  query: string;
  limit: number;
  offset: number;
  estimated_total_hits: number;
}

export interface MultiSearchResults {
  results: Record<string, MeilisearchResults>;
}

// Hook for searching across all content types or specific index
export const useSearch = (
  query: string, 
  index?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['search', query, index],
    queryFn: async () => {
      if (!query.trim()) {
        return { results: {} } as MultiSearchResults;
      }
      
      const searchPayload = {
        query: query.trim(),
        index: index || null,
        limit: 50,
        offset: 0,
      };
      
      return apiClient.post<MultiSearchResults>('/search/', searchPayload);
    },
    enabled: !!query.trim() && (options?.enabled !== false),
  });
};

// Hook for filtered search with additional parameters
export const useFilteredSearch = (
  query: string,
  index?: string,
  filters?: {
    limit?: number;
    offset?: number;
    filter?: string;
    sort?: string[];
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['search', 'filtered', query, index, filters],
    queryFn: async () => {
      if (!query.trim()) {
        return { results: {} } as MultiSearchResults;
      }
      
      const searchPayload = {
        query: query.trim(),
        index: index || null,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        filter: filters?.filter || null,
        sort: filters?.sort || null,
      };
      
      return apiClient.post<MultiSearchResults>('/search/', searchPayload);
    },
    enabled: !!query.trim() && (options?.enabled !== false),
  });
};
