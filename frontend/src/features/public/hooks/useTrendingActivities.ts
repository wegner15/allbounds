import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Activity, MediaAsset } from '../../../lib/types/api';

// We need to extend the base Activity type to include fields the component expects.
// This assumes the API can return these fields, even if not in the base type definition.
export interface ActivityWithDetails extends Activity {
  price?: number;
  rating?: number;
  review_count?: number;
  duration?: string;
  cover_image?: MediaAsset;
}

// Fetch trending activities, optionally filtered by country
export const useTrendingActivities = (countryName?: string) => {
  return useQuery<ActivityWithDetails[], Error>({
    queryKey: ['trending-activities', countryName],
    queryFn: async () => {
      // For now, just fetch all activities since the backend doesn't support trending parameter
      // TODO: Add trending support to backend or implement client-side filtering
      const url = `${endpoints.activities.list()}?limit=12`;
      const response = await apiClient.get<ActivityWithDetails[]>(url);
      return response;
    },
    enabled: true, // Always fetch activities
  });
};
