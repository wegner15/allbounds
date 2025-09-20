import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { GroupTrip, GroupTripDeparture } from '../types/api';

// Hook for fetching all group trips
export const useGroupTrips = (params?: { 
  country_id?: number;
  holiday_type_id?: number;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${endpoints.groupTrips.list()}?${queryString}` : endpoints.groupTrips.list();
  
  return useQuery({
    queryKey: ['groupTrips', params],
    queryFn: async () => {
      return apiClient.get<GroupTrip[]>(endpoint);
    },
  });
};

// Hook for fetching group trips by country
export const useGroupTripsByCountry = (countryId: number) => {
  return useQuery({
    queryKey: ['groupTrips', 'country', countryId],
    queryFn: async () => {
      return apiClient.get<GroupTrip[]>(endpoints.groupTrips.byCountry(countryId));
    },
    enabled: !!countryId, // Only run the query if countryId is provided
  });
};

// Hook for fetching group trips by holiday type
export const useGroupTripsByHolidayType = (holidayTypeId: number) => {
  return useQuery({
    queryKey: ['groupTrips', 'holidayType', holidayTypeId],
    queryFn: async () => {
      return apiClient.get<GroupTrip[]>(endpoints.groupTrips.byHolidayType(holidayTypeId));
    },
    enabled: !!holidayTypeId, // Only run the query if holidayTypeId is provided
  });
};

// Hook for fetching a single group trip by ID
export const useGroupTrip = (id: number) => {
  return useQuery({
    queryKey: ['groupTrip', id],
    queryFn: async () => {
      return apiClient.get<GroupTrip>(endpoints.groupTrips.byId(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for fetching a single group trip by slug
export const useGroupTripBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['groupTrip', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<GroupTrip>(endpoints.groupTrips.bySlug(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// Hook for fetching group trip details with gallery by slug
export const useGroupTripDetailsBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['groupTripDetails', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<any>(`/group-trips/details/${slug}`);
    },
    enabled: !!slug,
  });
};

// Hook for fetching group trip details with gallery by ID (for admin)
export const useGroupTripDetailsById = (id: number) => {
  return useQuery({
    queryKey: ['groupTripDetails', 'id', id],
    queryFn: async () => {
      return apiClient.get<any>(`/group-trips/details/id/${id}`);
    },
    enabled: !!id,
  });
};

// Hook for fetching departures for a group trip
export const useGroupTripDepartures = (groupTripId: number) => {
  return useQuery({
    queryKey: ['groupTrip', groupTripId, 'departures'],
    queryFn: async () => {
      return apiClient.get<GroupTripDeparture[]>(endpoints.groupTrips.departures(groupTripId));
    },
    enabled: !!groupTripId, // Only run the query if groupTripId is provided
  });
};

// Hook for creating a new group trip (admin only)
export const useCreateGroupTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupTripData: Omit<GroupTrip, 'id' | 'created_at' | 'updated_at' | 'country' | 'holiday_types' | 'departures'>) => {
      return apiClient.post<GroupTrip>(endpoints.groupTrips.list(), groupTripData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groupTrips'] });
      queryClient.invalidateQueries({ queryKey: ['groupTrips', 'country', data.country_id] });
    },
  });
};

// Hook for updating a group trip (admin only)
export const useUpdateGroupTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupTripData: Partial<GroupTrip> & { id: number }) => {
      // Use the ID from the provided data
      const { id } = groupTripData;
      console.log('In useUpdateGroupTrip - ID:', id);
      console.log('In useUpdateGroupTrip - Full data:', groupTripData);
      
      // Make sure we have an ID
      if (!id) {
        throw new Error('Group trip ID is required for update');
      }
      
      return apiClient.put<GroupTrip>(endpoints.groupTrips.byId(id), groupTripData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.setQueryData(['groupTrip', id], data);
      queryClient.invalidateQueries({ queryKey: ['groupTrips'] });
      queryClient.invalidateQueries({ queryKey: ['groupTrips', 'country', data.country_id] });
    },
  });
};

// Hook for creating a new departure for a group trip (admin only)
export const useCreateGroupTripDeparture = (groupTripId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (departureData: Omit<GroupTripDeparture, 'id' | 'group_trip_id'>) => {
      return apiClient.post<GroupTripDeparture>(`${endpoints.groupTrips.byId(groupTripId)}/departures`, {
        ...departureData,
        group_trip_id: groupTripId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupTrip', groupTripId, 'departures'] });
      queryClient.invalidateQueries({ queryKey: ['groupTrip', groupTripId] });
    },
  });
};
