import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { CountryVisitInfo } from '../types/country';

export const useCountryVisitInfo = (countryId: number) => {
  return useQuery({
    queryKey: ['countryVisitInfo', countryId],
    queryFn: () => apiClient.get<CountryVisitInfo>(endpoints.countries.visitInfo(countryId)),
    enabled: !!countryId,
  });
};

export const useUpdateCountryVisitInfo = (countryId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CountryVisitInfo>) => 
      apiClient.put<CountryVisitInfo>(endpoints.countries.updateVisitInfo(countryId), data),
    onSuccess: () => {
      // Invalidate and refetch the country visit info
      queryClient.invalidateQueries({ queryKey: ['countryVisitInfo', countryId] });
      // Also invalidate the country details query if it exists
      queryClient.invalidateQueries({ queryKey: ['country', countryId] });
    },
  });
};
