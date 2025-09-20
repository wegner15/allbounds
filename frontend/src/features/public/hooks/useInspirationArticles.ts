import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { BlogPost } from '../../../lib/types/api';

// Fetch inspiration articles (blog posts)
export const useInspirationArticles = (limit: number = 4) => {
  return useQuery<BlogPost[], Error>({
    queryKey: ['inspiration-articles', limit],
    queryFn: async () => {
      // Assuming the API can filter for featured/recent posts
      const response = await apiClient.get<BlogPost[]>(`${endpoints.blog.list()}?featured=true&limit=${limit}`);
      return response;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
