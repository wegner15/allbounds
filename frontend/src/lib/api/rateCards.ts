import { apiClient } from '../api';

export type CostBasis = 'per_person' | 'per_group' | 'per_room' | 'per_vehicle' | 'per_booking';

export interface RateCardItem {
  id?: number;
  rate_card_id?: number;
  name: string;
  description?: string | null;
  cost_basis: CostBasis;
  unit?: string | null;
  rate: number;
  tax_amount: number;
  room_occupancy?: string | null;
  meal_plan?: string | null;
  capacity?: number | null;
  min_pax?: number | null;
  max_pax?: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface RateCard {
  id: number;
  supplier_id: number;
  supplier_name?: string | null;
  name: string;
  quote_reference?: string | null;
  service_type: string;
  destination?: string | null;
  currency: string;
  valid_from?: string | null;
  valid_to?: string | null;
  notes?: string | null;
  is_active: boolean;
  items: RateCardItem[];
}

export type RateCardInput = Omit<RateCard, 'id' | 'supplier_name' | 'items'> & { items: RateCardItem[] };

export const rateCardsApi = {
  list(params: {
    supplier_id?: number; service_type?: string; destination?: string;
    valid_on?: string; active_only?: boolean; search?: string; skip?: number; limit?: number;
  } = {}): Promise<RateCard[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v));
    });
    return apiClient.get(`/rate-cards?${q.toString()}`);
  },
  get: (id: number): Promise<RateCard> => apiClient.get(`/rate-cards/${id}`),
  create: (data: RateCardInput): Promise<RateCard> => apiClient.post('/rate-cards', data),
  update: (id: number, data: Partial<Omit<RateCard, 'items'>>): Promise<RateCard> =>
    apiClient.patch(`/rate-cards/${id}`, data),
  remove: (id: number) => apiClient.delete(`/rate-cards/${id}`),
  duplicate: (id: number): Promise<RateCard> => apiClient.post(`/rate-cards/${id}/duplicate`),
  addItem: (id: number, item: RateCardItem): Promise<RateCardItem> =>
    apiClient.post(`/rate-cards/${id}/items`, item),
  updateItem: (id: number, itemId: number, item: Partial<RateCardItem>): Promise<RateCardItem> =>
    apiClient.patch(`/rate-cards/${id}/items/${itemId}`, item),
  removeItem: (id: number, itemId: number) => apiClient.delete(`/rate-cards/${id}/items/${itemId}`),
};
