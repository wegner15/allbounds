import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Partner } from '../types/api';

export interface PartnerCreateInput {
  name: string;
  category: string;
  logo_image_id?: string;
  website_url?: string;
  order_index?: number;
}

export interface PartnerUpdateInput extends Partial<PartnerCreateInput> {
  is_active?: boolean;
}

// Hook for fetching partners (optionally filtered by category)
export const usePartners = (category?: string) => {
  return useQuery<Partner[]>({
    queryKey: ['partners', category],
    queryFn: async () => {
      const response = await apiClient.get<Partner[]>(endpoints.partners.list(category));
      return response;
    }
  });
};

// Hook for fetching a single partner by ID
export const usePartner = (id: number) => {
  return useQuery<Partner>({
    queryKey: ['partners', id],
    queryFn: async () => {
      const response = await apiClient.get<Partner>(endpoints.partners.detail(id));
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new partner
export const useCreatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: PartnerCreateInput) => {
      const response = await apiClient.post<Partner>(endpoints.partners.create(), partner);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};

// Hook for updating a partner
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...partner }: PartnerUpdateInput & { id: number }) => {
      const response = await apiClient.put<Partner>(endpoints.partners.update(id), partner);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', variables.id] });
    },
  });
};

// Hook for deleting a partner
export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<Partner>(endpoints.partners.delete(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};
