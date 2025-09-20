import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface Attraction {
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
  address?: string;
  city?: string;
  location?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  duration_minutes?: number;
  price?: number;
  opening_hours?: string;
  image_id?: string;
  cover_image?: string;
  gallery_images?: Array<{
    id: number;
    file_path: string;
    alt_text?: string;
    caption?: string;
  }>;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttractionCreateInput {
  name: string;
  summary?: string;
  description?: string;
  country_id: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  duration_minutes?: number;
  price?: number;
  opening_hours?: string;
  image_id?: string;
  cover_image?: string;
}

export interface AttractionUpdateInput extends Partial<AttractionCreateInput> {
  is_active?: boolean;
}

export interface AttractionRelationships {
  package_ids: number[];
  group_trip_ids: number[];
}

// Hook for fetching attractions
export const useAttractions = () => {
  return useQuery<Attraction[]>({
    queryKey: ['attractions'],
    queryFn: async () => {
      const response = await apiClient.get<Attraction[]>('/attractions');
      return response;
    }
  });
};

// Hook for fetching a single attraction by ID
export const useAttraction = (id: number) => {
  return useQuery<Attraction>({
    queryKey: ['attractions', id],
    queryFn: async () => {
      const response = await apiClient.get<Attraction>(`/attractions/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new attraction
export const useCreateAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attraction: AttractionCreateInput) => {
      const response = await apiClient.post('/attractions', attraction);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
    },
  });
};

// Hook for updating an attraction
export const useUpdateAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...attraction }: AttractionUpdateInput & { id: number }) => {
      const response = await apiClient.put(`/attractions/${id}`, attraction);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['attractions', variables.id] });
    },
  });
};

// Hook for deleting an attraction
export const useDeleteAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/attractions/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
    },
  });
};

// Hook for fetching attraction's relationships
export const useAttractionRelationships = (id: number) => {
  return useQuery<AttractionRelationships>({
    queryKey: ['attractions', id, 'relationships'],
    queryFn: async () => {
      const response = await apiClient.get<AttractionRelationships>(`/attractions/${id}/relationships`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for assigning a package to an attraction
export const useAssignPackageToAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attractionId, packageId }: { attractionId: number; packageId: number }) => {
      const response = await apiClient.post(`/attractions/${attractionId}/packages/${packageId}`, {});
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attractions', variables.attractionId, 'relationships'] });
    },
  });
};

// Hook for removing a package from an attraction
export const useRemovePackageFromAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attractionId, packageId }: { attractionId: number; packageId: number }) => {
      const response = await apiClient.delete(`/attractions/${attractionId}/packages/${packageId}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attractions', variables.attractionId, 'relationships'] });
    },
  });
};

// Hook for assigning a group trip to an attraction
export const useAssignGroupTripToAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attractionId, groupTripId }: { attractionId: number; groupTripId: number }) => {
      const response = await apiClient.post(`/attractions/${attractionId}/group-trips/${groupTripId}`, {});
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attractions', variables.attractionId, 'relationships'] });
    },
  });
};

// Hook for removing a group trip from an attraction
export const useRemoveGroupTripFromAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attractionId, groupTripId }: { attractionId: number; groupTripId: number }) => {
      const response = await apiClient.delete(`/attractions/${attractionId}/group-trips/${groupTripId}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attractions', variables.attractionId, 'relationships'] });
    },
  });
};
