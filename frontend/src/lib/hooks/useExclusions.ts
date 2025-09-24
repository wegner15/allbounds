import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface Exclusion {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExclusionCreateInput {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface ExclusionUpdateInput extends Partial<ExclusionCreateInput> {
  is_active?: boolean;
}

// Hook for fetching all exclusions
export const useExclusions = () => {
  return useQuery<Exclusion[]>({
    queryKey: ['exclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Exclusion[]>('/exclusions/');
      return response;
    }
  });
};

// Hook for fetching a single exclusion by ID
export const useExclusion = (id: number) => {
  return useQuery<Exclusion>({
    queryKey: ['exclusions', id],
    queryFn: async () => {
      const response = await apiClient.get<Exclusion>(`/exclusions/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new exclusion
export const useCreateExclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exclusion: ExclusionCreateInput) => {
      const response = await apiClient.post('/exclusions/', exclusion);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exclusions'] });
    },
  });
};

// Hook for updating an exclusion
export const useUpdateExclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...exclusion }: ExclusionUpdateInput & { id: number }) => {
      const response = await apiClient.put(`/exclusions/${id}`, exclusion);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exclusions'] });
      queryClient.invalidateQueries({ queryKey: ['exclusions', variables.id] });
    },
  });
};

// Hook for deleting an exclusion
export const useDeleteExclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/exclusions/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exclusions'] });
    },
  });
};

// Hook for fetching exclusions for a specific package
export const usePackageExclusions = (packageId: number) => {
  return useQuery<Exclusion[]>({
    queryKey: ['packages', packageId, 'exclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Exclusion[]>(`/packages/${packageId}/exclusions`);
      return response;
    },
    enabled: !!packageId,
  });
};

// Hook for fetching exclusions for a specific group trip
export const useGroupTripExclusions = (groupTripId: number) => {
  return useQuery<Exclusion[]>({
    queryKey: ['group-trips', groupTripId, 'exclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Exclusion[]>(`/group-trips/${groupTripId}/exclusions`);
      return response;
    },
    enabled: !!groupTripId,
  });
};

// Hook for assigning exclusions to a package
export const useAssignExclusionsToPackage = (packageId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exclusionIds: number[]) => {
      const response = await apiClient.post(`/packages/${packageId}/exclusions`, { exclusion_ids: exclusionIds });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages', packageId, 'exclusions'] });
      queryClient.invalidateQueries({ queryKey: ['packages', packageId] });
    },
  });
};

// Hook for assigning exclusions to a group trip
export const useAssignExclusionsToGroupTrip = (groupTripId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exclusionIds: number[]) => {
      const response = await apiClient.post(`/group-trips/${groupTripId}/exclusions`, { exclusion_ids: exclusionIds });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-trips', groupTripId, 'exclusions'] });
      queryClient.invalidateQueries({ queryKey: ['group-trips', groupTripId] });
    },
  });
};
