import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface HotelType {
  id: number;
  name: string;
  description?: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelTypeCreateInput {
  name: string;
  description?: string;
}

export interface HotelTypeUpdateInput extends Partial<HotelTypeCreateInput> {
  is_active?: boolean;
}

// Hook for fetching hotel types
export const useHotelTypes = () => {
  return useQuery<HotelType[]>({
    queryKey: ['hotelTypes'],
    queryFn: async () => {
      const response = await apiClient.get<HotelType[]>('/hotel-types/');
      return response;
    }
  });
};

// Hook for fetching a single hotel type by ID
export const useHotelType = (id: number) => {
  return useQuery<HotelType>({
    queryKey: ['hotelTypes', id],
    queryFn: async () => {
      const response = await apiClient.get<HotelType>(`/hotel-types/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new hotel type
export const useCreateHotelType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hotelType: HotelTypeCreateInput) => {
      const response = await apiClient.post('/hotel-types/', hotelType);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelTypes'] });
    },
  });
};

// Hook for updating a hotel type
export const useUpdateHotelType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...hotelType }: HotelTypeUpdateInput & { id: number }) => {
      const response = await apiClient.put(`/hotel-types/${id}`, hotelType);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotelTypes'] });
      queryClient.invalidateQueries({ queryKey: ['hotelTypes', variables.id] });
    },
  });
};

// Hook for deleting a hotel type
export const useDeleteHotelType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/hotel-types/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelTypes'] });
    },
  });
};
