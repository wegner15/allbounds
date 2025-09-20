import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Review } from '../../../lib/types/api';

// Fetch customer reviews
export const useCustomerReviews = (limit: number = 5) => {
  return useQuery<Review[], Error>({
    queryKey: ['customer-reviews', limit],
    queryFn: async () => {
      // Assuming the API can filter for approved/featured reviews
      const response = await apiClient.get<Review[]>(`${endpoints.reviews.list()}?approved=true&limit=${limit}`);
      return response;
    },
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
};
