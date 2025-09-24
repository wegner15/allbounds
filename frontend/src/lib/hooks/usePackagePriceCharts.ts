import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface PriceChart {
  id: number;
  package_id: number;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceChartCreateInput {
  package_id: number;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  is_active?: boolean;
}

export interface PriceChartUpdateInput {
  title?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  is_active?: boolean;
}

// Hook for fetching price charts for a specific package
export const usePackagePriceCharts = (packageId: number) => {
  return useQuery<PriceChart[]>({
    queryKey: ['packages', packageId, 'price-charts'],
    queryFn: async () => {
      const response = await apiClient.get<PriceChart[]>(`/packages/${packageId}/price-charts`);
      return response;
    },
    enabled: !!packageId,
  });
};

// Hook for fetching active price charts for a specific package
export const useActivePackagePriceCharts = (packageId: number) => {
  return useQuery<PriceChart[]>({
    queryKey: ['packages', packageId, 'price-charts', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<PriceChart[]>(`/packages/${packageId}/price-charts/active`);
      return response;
    },
    enabled: !!packageId,
  });
};

// Hook for fetching a single price chart by ID
export const usePriceChart = (priceChartId: number) => {
  return useQuery<PriceChart>({
    queryKey: ['price-charts', priceChartId],
    queryFn: async () => {
      const response = await apiClient.get<PriceChart>(`/price-charts/${priceChartId}`);
      return response;
    },
    enabled: !!priceChartId,
  });
};

// Hook for creating a new price chart
export const useCreatePriceChart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (priceChart: PriceChartCreateInput) => {
      const response = await apiClient.post<PriceChart>('/price-charts', priceChart);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages', data.package_id, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: ['packages', data.package_id, 'price-charts', 'active'] });
    },
  });
};

// Hook for updating a price chart
export const useUpdatePriceChart = (priceChartId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (priceChart: PriceChartUpdateInput) => {
      const response = await apiClient.put<PriceChart>(`/price-charts/${priceChartId}`, priceChart);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['price-charts', priceChartId] });
      queryClient.invalidateQueries({ queryKey: ['packages', data.package_id, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: ['packages', data.package_id, 'price-charts', 'active'] });
    },
  });
};

// Hook for deleting a price chart
export const useDeletePriceChart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ priceChartId, packageId }: { priceChartId: number, packageId: number }) => {
      await apiClient.delete(`/price-charts/${priceChartId}`);
      return { priceChartId, packageId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages', data.packageId, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: ['packages', data.packageId, 'price-charts', 'active'] });
    },
  });
};
