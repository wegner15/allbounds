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

export function calculateScenarioLocally(
  quote: QuoteWrite,
  scenario: QuoteScenario
): QuoteResult {
  const pax = Math.max(1, Number(scenario.pax) || 1);
  const foc = Math.max(0, Number(scenario.foc_count) || 0);
  const rooms = Math.max(0, Number(scenario.rooms) || 0);
  const paying = Math.max(1, pax - foc);

  const byComponent: Record<string, number> = {};
  let optionalCost = 0;

  for (const it of quote.items || []) {
    const unit = (Number(it.unit_cost) || 0) + (Number(it.tax_amount) || 0);
    const qty = it.qty !== undefined && it.qty !== null ? Number(it.qty) : 1;
    const basis = it.cost_basis || 'per_person';
    let mult = 1;

    if (basis === 'per_person') {
      mult = pax;
    } else if (basis === 'per_room') {
      mult = rooms;
    } else if (basis === 'per_vehicle') {
      const cap = Number(it.capacity) || 0;
      mult = cap > 0 ? Math.ceil(pax / cap) : 1;
    } else {
      mult = 1;
    }

    const c = unit * qty * mult;
    if (it.is_optional) {
      optionalCost += c;
    } else {
      const ct = it.component_type || 'other';
      byComponent[ct] = (byComponent[ct] || 0) + c;
    }
  }

  const direct = Object.values(byComponent).reduce((a, b) => a + b, 0);
  const contingency = (direct * (Number(quote.contingency_percent) || 0)) / 100;
  const totalCost = direct + contingency;

  const method = quote.pricing_method || 'markup';
  const v = Number(quote.pricing_value) || 0;
  let gross = totalCost;
  if (method === 'margin') {
    gross = v >= 100 ? totalCost : totalCost / (1 - v / 100);
  } else {
    gross = totalCost * (1 + v / 100);
  }

  let discountTotal = 0;
  for (const d of quote.discounts || []) {
    const val = Number(d.value) || 0;
    if (d.mode === 'percent') {
      discountTotal += (gross * val) / 100;
    } else if (d.scope === 'per_person') {
      discountTotal += val * paying;
    } else {
      discountTotal += val;
    }
  }
  discountTotal = Math.min(discountTotal, gross);
  const net = gross - discountTotal;

  let taxAmount = 0;
  let netExTax = net;
  let finalTotal = net;

  if (quote.tax_enabled && (Number(quote.tax_rate) || 0) > 0) {
    const rate = Number(quote.tax_rate) / 100;
    if (quote.tax_inclusive) {
      taxAmount = net - net / (1 + rate);
      netExTax = net - taxAmount;
      finalTotal = net;
    } else {
      netExTax = net;
      taxAmount = net * rate;
      finalTotal = net + taxAmount;
    }
  }

  const profit = netExTax - totalCost;
  const margin = netExTax > 0 ? (profit / netExTax) * 100 : 0;
  const markupApplied = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const perPerson = finalTotal / paying;

  let optSell = optionalCost;
  if (method === 'margin') {
    optSell = v >= 100 ? optionalCost : optionalCost / (1 - v / 100);
  } else {
    optSell = optionalCost * (1 + v / 100);
  }

  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  return {
    scenario_id: scenario.id,
    label: scenario.label,
    pax,
    foc_count: foc,
    paying_pax: paying,
    rooms,
    cost_by_component: Object.fromEntries(
      Object.entries(byComponent).map(([k, val]) => [k, r2(val)])
    ),
    direct_cost: r2(direct),
    contingency: r2(contingency),
    total_cost: r2(totalCost),
    selling_price_before_discount: r2(gross),
    discount_total: r2(discountTotal),
    price_before_tax: r2(netExTax),
    tax_amount: r2(taxAmount),
    final_total: r2(finalTotal),
    price_per_person: r2(perPerson),
    price_per_room: rooms > 0 ? r2(finalTotal / rooms) : null,
    expected_profit: r2(profit),
    profit_margin_percent: r2(margin),
    effective_markup_percent: r2(markupApplied),
    optional_cost: r2(optionalCost),
    optional_price_per_person: r2(optSell / paying),
  };
}

export function calculateQuoteLocally(quote: QuoteWrite): QuoteResult[] {
  return (quote.scenarios || []).map((s) => calculateScenarioLocally(quote, s));
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
