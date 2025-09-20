import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { 
  EntityType,
  ItineraryItem,
  ItineraryActivity,
  ItineraryResponse
} from '../types/itinerary';

export interface CreateItineraryItemData {
  entity_type: 'package' | 'group_trip';
  entity_id: number;
  day_number: number;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hotel_ids: number[];
  attraction_ids: number[];
  linked_activity_ids?: number[];
  accommodation_notes?: string;
  custom_activities: CreateActivityData[];
}

export interface CreateActivityData {
  time?: string;
  activity_title: string;
  activity_description?: string;
  location?: string;
  attraction_id?: number;
  duration_hours?: number;
  is_meal?: boolean;
  meal_type?: 'breakfast' | 'lunch' | 'dinner';
  order_index?: number;
}

export interface UpdateItineraryItemData {
  day_number?: number;
  date?: string;
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hotel_ids?: number[];
  attraction_ids?: number[];
  linked_activity_ids?: number[];
  accommodation_notes?: string;
}

export interface UpdateActivityData {
  time?: string;
  activity_title?: string;
  activity_description?: string;
  location?: string;
  attraction_id?: number;
  duration_hours?: number;
  is_meal?: boolean;
  meal_type?: 'breakfast' | 'lunch' | 'dinner';
  order_index?: number;
}

// Query hooks
export const useItinerary = (entityType: EntityType, entityId: number) => {
  return useQuery<ItineraryResponse>({
    queryKey: ['itinerary', entityType, entityId],
    queryFn: () => apiClient.get<ItineraryResponse>(`/itinerary/${entityType}/${entityId}`),
    enabled: !!entityId,
  });
};

export const useItineraryItem = (itemId: number) => {
  return useQuery<ItineraryItem>({
    queryKey: ['itinerary-item', itemId],
    queryFn: () => apiClient.get<ItineraryItem>(`/itinerary/items/${itemId}`),
    enabled: !!itemId,
  });
};

// Mutation hooks
export const useCreateItineraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateItineraryItemData) => {
      console.log('API call - Creating itinerary item:', data);
      try {
        const result = await apiClient.post<ItineraryItem>('/itinerary/items', data);
        console.log('API call - Success:', result);
        return result;
      } catch (error) {
        console.error('API call - Error:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      console.log('Mutation success - Invalidating queries for:', variables.entity_type, variables.entity_id);
      queryClient.invalidateQueries({
        queryKey: ['itinerary', variables.entity_type, variables.entity_id]
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useUpdateItineraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateItineraryItemData }) =>
      apiClient.put<ItineraryItem>(`/itinerary/items/${itemId}`, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-item', data.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['itinerary', data.entity_type, data.entity_id]
      });
    },
  });
};

export const useDeleteItineraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: number) =>
      apiClient.delete(`/itinerary/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary']
      });
    },
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: CreateActivityData }) =>
      apiClient.post<ItineraryActivity>(`/itinerary/items/${itemId}/activities`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-item', variables.itemId]
      });
      queryClient.invalidateQueries({
        queryKey: ['itinerary']
      });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: number; data: UpdateActivityData }) =>
      apiClient.put<ItineraryActivity>(`/itinerary/activities/${activityId}`, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-item', data.itinerary_item_id]
      });
      queryClient.invalidateQueries({
        queryKey: ['itinerary']
      });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityId: number) =>
      apiClient.delete(`/itinerary/activities/${activityId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary']
      });
    },
  });
};

export const useReorderActivities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, activityIds }: { itemId: number; activityIds: number[] }) =>
      apiClient.put(`/itinerary/items/${itemId}/activities/reorder`, { activity_ids: activityIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary-item', variables.itemId]
      });
      queryClient.invalidateQueries({
        queryKey: ['itinerary']
      });
    },
  });
};

export const useReorderItineraryItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ entityType, entityId, itemIds }: { 
      entityType: 'package' | 'group_trip'; 
      entityId: number; 
      itemIds: number[] 
    }) =>
      apiClient.put(`/itinerary/${entityType}/${entityId}/reorder`, { item_ids: itemIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary', variables.entityType, variables.entityId]
      });
    },
  });
};

export const useBulkCreateItinerary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { entity_type: 'package' | 'group_trip'; entity_id: number; items: CreateItineraryItemData[] }) =>
      apiClient.post<ItineraryItem[]>('/itinerary/bulk', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary', variables.entity_type, variables.entity_id]
      });
    },
  });
};

export const useGenerateGroupTripDates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupTripId, startDate }: { groupTripId: number; startDate: string }) =>
      apiClient.post(`/itinerary/group-trips/${groupTripId}/generate-dates`, { start_date: startDate }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itinerary', 'group_trip', variables.groupTripId]
      });
    },
  });
};
