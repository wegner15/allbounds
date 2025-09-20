import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { SearchResult } from '../types/api';

// Hook for searching across all content types
export const useSearch = (query: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { items: [], total: 0 };
      return apiClient.get<{ items: SearchResult[], total: number }>(endpoints.search.query(query));
    },
    enabled: !!query.trim() && (options?.enabled !== false),
  });
};

// Hook for filtered search
export const useFilteredSearch = (
  query: string,
  filters: Record<string, string>,
  options?: { enabled?: boolean }
) => {
  const filterParams = { q: query, ...filters };
  
  return useQuery({
    queryKey: ['search', 'filtered', query, filters],
    queryFn: async () => {
      if (!query.trim()) return { items: [], total: 0 };
      return apiClient.get<{ items: SearchResult[], total: number }>(endpoints.search.filter(filterParams));
    },
    enabled: !!query.trim() && (options?.enabled !== false),
  });
};
