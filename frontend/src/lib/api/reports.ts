import { apiClient } from '../api';
import type {
  SalesReport,
  ReceivablesAgingReport,
  PayablesAgingReport,
  ProfitabilityReport,
  CashFlowReport,
} from '../types/finance';

export const reportsApi = {
  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/sales${qs}`);
  },

  async getReceivablesAging(): Promise<ReceivablesAgingReport> {
    return apiClient.get('/reports/receivables-aging');
  },

  async getPayablesAging(): Promise<PayablesAgingReport> {
    return apiClient.get('/reports/payables-aging');
  },

  async getProfitability(startDate?: string, endDate?: string): Promise<ProfitabilityReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/profitability${qs}`);
  },

  async getCashFlow(startDate?: string, endDate?: string): Promise<CashFlowReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/cash-flow${qs}`);
  },
};
