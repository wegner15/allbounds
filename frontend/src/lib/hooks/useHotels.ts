import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface Hotel {
  id: number;
  name: string;
  summary?: string;
  description?: string;
  country_id: number;
  country?: {
    id: number;
    name: string;
    slug: string;
  };
  hotel_type_id?: number;
  hotel_type?: {
    id: number;
    name: string;
    slug: string;
  };
  stars?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price_category?: string;
  amenities?: Record<string, unknown>;
  check_in_time?: string;
  check_out_time?: string;
  image_id?: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelCreateInput {
  name: string;
  summary?: string;
  description?: string;
  country_id: number;
  hotel_type_id?: number;
  stars?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price_category?: string;
  amenities?: Record<string, unknown>;
  check_in_time?: string;
  check_out_time?: string;
  image_id?: string;
}

export interface HotelUpdateInput extends Partial<HotelCreateInput> {
  is_active?: boolean;
}

export interface HotelRelationships {
  package_ids: number[];
  group_trip_ids: number[];
}

// Hook for fetching hotels
export const useHotels = () => {
  return useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await apiClient.get<Hotel[]>('/hotels');
      return response;
    }
  });
};

// Hook for fetching a single hotel by ID
export const useHotel = (id: number) => {
  return useQuery<Hotel>({
    queryKey: ['hotels', id],
    queryFn: async () => {
      const response = await apiClient.get<Hotel>(`/hotels/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Extended hotel interface for detailed view
export interface HotelDetails extends Hotel {
  cover_image?: string;
  gallery_images?: Array<{
    id: number;
    filename: string;
    alt_text?: string;
    title?: string;
    caption?: string;
    width?: number;
    height?: number;
    file_path: string;
  }>;
}

// Hook for fetching hotel details by slug
export const useHotelBySlug = (slug: string) => {
  return useQuery<HotelDetails>({
    queryKey: ['hotels', 'slug', slug],
    queryFn: async () => {
      const response = await apiClient.get<HotelDetails>(`/hotels/details/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
};

// Hook for creating a new hotel
export const useCreateHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hotel: HotelCreateInput) => {
      const response = await apiClient.post('/hotels', hotel);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
};

// Hook for updating a hotel
export const useUpdateHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...hotel }: HotelUpdateInput & { id: number }) => {
      const response = await apiClient.put(`/hotels/${id}`, hotel);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.id] });
    },
  });
};

// Hook for deleting a hotel
export const useDeleteHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/hotels/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
};

// Hook for fetching hotel's relationships
export const useHotelRelationships = (id: number) => {
  return useQuery<HotelRelationships>({
    queryKey: ['hotels', id, 'relationships'],
    queryFn: async () => {
      const response = await apiClient.get<HotelRelationships>(`/hotels/${id}/relationships`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for assigning a package to a hotel
export const useAssignPackageToHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ hotelId, packageId }: { hotelId: number; packageId: number }) => {
      const response = await apiClient.post(`/hotels/${hotelId}/packages/${packageId}`, {});
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId, 'relationships'] });
    },
  });
};

// Hook for removing a package from a hotel
export const useRemovePackageFromHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ hotelId, packageId }: { hotelId: number; packageId: number }) => {
      const response = await apiClient.delete(`/hotels/${hotelId}/packages/${packageId}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId, 'relationships'] });
    },
  });
};

// Hook for assigning a group trip to a hotel
export const useAssignGroupTripToHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ hotelId, groupTripId }: { hotelId: number; groupTripId: number }) => {
      const response = await apiClient.post(`/hotels/${hotelId}/group-trips/${groupTripId}`, {});
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId, 'relationships'] });
    },
  });
};

// Hook for removing a group trip from a hotel
export const useRemoveGroupTripFromHotel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ hotelId, groupTripId }: { hotelId: number; groupTripId: number }) => {
      const response = await apiClient.delete(`/hotels/${hotelId}/group-trips/${groupTripId}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.hotelId, 'relationships'] });
    },
  });
};
