import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface Inclusion {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InclusionCreateInput {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface InclusionUpdateInput extends Partial<InclusionCreateInput> {
  is_active?: boolean;
}

// Hook for fetching all inclusions
export const useInclusions = () => {
  return useQuery<Inclusion[]>({
    queryKey: ['inclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Inclusion[]>('/inclusions/');
      return response;
    }
  });
};

// Hook for fetching a single inclusion by ID
export const useInclusion = (id: number) => {
  return useQuery<Inclusion>({
    queryKey: ['inclusions', id],
    queryFn: async () => {
      const response = await apiClient.get<Inclusion>(`/inclusions/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new inclusion
export const useCreateInclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inclusion: InclusionCreateInput) => {
      const response = await apiClient.post('/inclusions/', inclusion);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inclusions'] });
    },
  });
};

// Hook for updating an inclusion
export const useUpdateInclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...inclusion }: InclusionUpdateInput & { id: number }) => {
      const response = await apiClient.put(`/inclusions/${id}`, inclusion);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inclusions'] });
      queryClient.invalidateQueries({ queryKey: ['inclusions', variables.id] });
    },
  });
};

// Hook for deleting an inclusion
export const useDeleteInclusion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/inclusions/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inclusions'] });
    },
  });
};

// Hook for fetching inclusions for a specific package
export const usePackageInclusions = (packageId: number) => {
  return useQuery<Inclusion[]>({
    queryKey: ['packages', packageId, 'inclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Inclusion[]>(`/packages/${packageId}/inclusions`);
      return response;
    },
    enabled: !!packageId,
  });
};

// Hook for fetching inclusions for a specific group trip
export const useGroupTripInclusions = (groupTripId: number) => {
  return useQuery<Inclusion[]>({
    queryKey: ['group-trips', groupTripId, 'inclusions'],
    queryFn: async () => {
      const response = await apiClient.get<Inclusion[]>(`/group-trips/${groupTripId}/inclusions`);
      return response;
    },
    enabled: !!groupTripId,
  });
};

// Hook for assigning inclusions to a package
export const useAssignInclusionsToPackage = (packageId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inclusionIds: number[]) => {
      const response = await apiClient.post(`/packages/${packageId}/inclusions`, { inclusion_ids: inclusionIds });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages', packageId, 'inclusions'] });
      queryClient.invalidateQueries({ queryKey: ['packages', packageId] });
    },
  });
};

// Hook for assigning inclusions to a group trip
export const useAssignInclusionsToGroupTrip = (groupTripId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inclusionIds: number[]) => {
      const response = await apiClient.post(`/group-trips/${groupTripId}/inclusions`, { inclusion_ids: inclusionIds });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-trips', groupTripId, 'inclusions'] });
      queryClient.invalidateQueries({ queryKey: ['group-trips', groupTripId] });
    },
  });
};
