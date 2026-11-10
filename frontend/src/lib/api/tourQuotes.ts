import { apiClient } from '../api';
import type { CostBasis } from './rateCards';

export type QuoteStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';

export interface QuoteScenario { id?: number; label?: string | null; pax: number; foc_count: number; rooms: number }
export interface QuoteDay {
  day_number: number;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  images?: string[];
}
export interface QuoteItem {
  id?: number;
  day_number: number | null;
  component_type: string;
  description: string;
  cost_basis: CostBasis;
  unit_cost: number;
  tax_amount: number;
  qty: number;
  capacity?: number | null;
  image_url?: string | null;
  supplier_id?: number | null;
  rate_card_item_id?: number | null;
  is_optional: boolean;
  sort_order: number;
}
export interface QuoteDiscount { label: string; mode: 'percent' | 'amount'; value: number; scope: 'total' | 'per_person' }

export interface QuoteResult {
  scenario_id?: number; label?: string | null; pax: number; foc_count: number; paying_pax: number; rooms: number;
  cost_by_component: Record<string, number>; direct_cost: number; contingency: number; total_cost: number;
  selling_price_before_discount: number; discount_total: number; price_before_tax: number; tax_amount: number;
  final_total: number; price_per_person: number; price_per_room: number | null; expected_profit: number;
  profit_margin_percent: number; effective_markup_percent: number; optional_cost: number; optional_price_per_person: number;
}

export interface QuoteWrite {
  name: string; destination?: string | null; category?: string | null; client_id?: number | null;
  client_name?: string | null; lead_reference?: string | null; start_date?: string | null; end_date?: string | null;
  currency: string; pricing_method: 'markup' | 'margin'; pricing_value: number; contingency_percent: number;
  tax_enabled: boolean; tax_name?: string | null; tax_rate: number; tax_inclusive: boolean; notes?: string | null;
  scenarios: QuoteScenario[]; days: QuoteDay[]; items: QuoteItem[]; discounts: QuoteDiscount[];
}

export interface Quote extends QuoteWrite {
  id: number;
  quote_number: string;
  status: QuoteStatus;
  prepared_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  invoice_id?: number | null;
  converted_scenario_id?: number | null;
  results: QuoteResult[];
}

export interface QuoteListItem {
  id: number; quote_number: string; name: string; destination?: string | null; client_name?: string | null;
  start_date?: string | null; currency: string; status: QuoteStatus; invoice_id?: number | null;
  scenario_summaries: { pax: number; price_per_person: number; final_total: number }[];
}

export interface CatalogueItem {
  entity_type: 'hotel' | 'attraction' | 'activity';
  entity_id: number;
  name: string;
  summary?: string | null;
  description?: string | null;
  destination?: string | null;
  country_name?: string | null;
  image_url?: string | null;
  suggested_component_type: string;
  suggested_cost_basis: CostBasis;
  default_price?: number | null;
  stars?: number | null;
  price_category?: string | null;
}

export const tourQuotesApi = {
  list(params: { status?: string; search?: string; skip?: number; limit?: number } = {}): Promise<QuoteListItem[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v)); });
    return apiClient.get(`/tour-quotes?${q.toString()}`);
  },
  searchCatalogue(params: {
    q?: string;
    category?: string;
    destination?: string;
    limit?: number;
  } = {}): Promise<CatalogueItem[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') q.set(k, String(v));
    });
    return apiClient.get(`/tour-quotes/catalogue-search?${q.toString()}`);
  },
  get: (id: number): Promise<Quote> => apiClient.get(`/tour-quotes/${id}`),
  create: (d: QuoteWrite): Promise<Quote> => apiClient.post('/tour-quotes', d),
  update: (id: number, d: QuoteWrite): Promise<Quote> => apiClient.put(`/tour-quotes/${id}`, d),
  remove: (id: number) => apiClient.delete(`/tour-quotes/${id}`),
  preview: (d: QuoteWrite): Promise<QuoteResult[]> => apiClient.post('/tour-quotes/preview', d),
  setStatus: (id: number, status: QuoteStatus): Promise<Quote> => apiClient.post(`/tour-quotes/${id}/status/${status}`),
  convert: (id: number, body: { scenario_id: number; due_date?: string; payment_terms?: string }): Promise<{ id: number }> =>
    apiClient.post(`/tour-quotes/${id}/convert-to-invoice`, body),
};
