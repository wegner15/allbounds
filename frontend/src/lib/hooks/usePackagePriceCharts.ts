import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { PriceChartHotelOption, HotelPriceChartNightRate } from '../types/api';

export interface PriceChart {
  id: number;
  package_id?: number;
  group_trip_id?: number;
  hotel_id?: number;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  booking_price?: number;
  notes?: string;
  is_active: boolean;
  hotel_options?: PriceChartHotelOption[];
  night_rates?: HotelPriceChartNightRate[];
  created_at: string;
  updated_at: string;
}

export interface PriceChartCreateInput {
  package_id?: number;
  group_trip_id?: number;
  hotel_id?: number;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  booking_price?: number;
  notes?: string;
  is_active?: boolean;
  hotel_options?: PriceChartHotelOption[];
  night_rates?: HotelPriceChartNightRate[];
}

export interface PriceChartUpdateInput {
  title?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  booking_price?: number;
  notes?: string;
  is_active?: boolean;
  hotel_options?: PriceChartHotelOption[];
  night_rates?: HotelPriceChartNightRate[];
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

// Generic multi-entity Hooks (Package, GroupTrip, Hotel)
export type PriceChartEntityType = 'package' | 'group_trip' | 'hotel';

const getEntityEndpoint = (entityType: PriceChartEntityType, entityId: number) => {
  if (entityType === 'group_trip') return `/group-trips/${entityId}/price-charts`;
  if (entityType === 'hotel') return `/hotels/${entityId}/price-charts`;
  return `/packages/${entityId}/price-charts`;
};

const getEntityCreateEndpoint = (entityType: PriceChartEntityType) => {
  if (entityType === 'group_trip') return `/group-trips/price-charts`;
  if (entityType === 'hotel') return `/hotels/price-charts`;
  return `/price-charts`;
};

const getEntityItemEndpoint = (entityType: PriceChartEntityType, id: number) => {
  if (entityType === 'group_trip') return `/group-trips/price-charts/${id}`;
  if (entityType === 'hotel') return `/hotels/price-charts/${id}`;
  return `/price-charts/${id}`;
};

export const useEntityPriceCharts = (entityType: PriceChartEntityType, entityId: number) => {
  return useQuery<PriceChart[]>({
    queryKey: [entityType, entityId, 'price-charts'],
    queryFn: async () => {
      return apiClient.get<PriceChart[]>(getEntityEndpoint(entityType, entityId));
    },
    enabled: !!entityId,
  });
};

export const useCreateEntityPriceChart = (entityType: PriceChartEntityType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, ...priceChart }: PriceChartCreateInput & { entityId: number }) => {
      const payload: any = { ...priceChart };
      if (entityType === 'package') payload.package_id = entityId;
      else if (entityType === 'group_trip') payload.group_trip_id = entityId;
      else if (entityType === 'hotel') payload.hotel_id = entityId;

      return apiClient.post<PriceChart>(getEntityCreateEndpoint(entityType), payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [entityType, variables.entityId, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: [entityType, variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['group-trips'] });
    },
  });
};

export const useUpdateEntityPriceChart = (entityType: PriceChartEntityType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, priceChartId, ...priceChart }: PriceChartUpdateInput & { entityId: number; priceChartId: number }) => {
      return apiClient.put<PriceChart>(getEntityItemEndpoint(entityType, priceChartId), priceChart);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [entityType, variables.entityId, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: [entityType, variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['group-trips'] });
    },
  });
};

export const useDeleteEntityPriceChart = (entityType: PriceChartEntityType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ priceChartId, entityId }: { priceChartId: number; entityId: number }) => {
      await apiClient.delete(getEntityItemEndpoint(entityType, priceChartId));
      return { priceChartId, entityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entityType, data.entityId, 'price-charts'] });
      queryClient.invalidateQueries({ queryKey: [entityType, data.entityId] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['group-trips'] });
    },
  });
};

