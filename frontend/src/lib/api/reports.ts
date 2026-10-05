import { apiClient } from '../api';
import type {
  SalesReport,
  ReceivablesAgingReport,
  PayablesAgingReport,
  ProfitabilityReport,
  CashFlowReport,
  ExecutiveSummaryReport,
  ReportGranularity,
} from '../types/finance';

export const reportsApi = {
  async getExecutiveSummary(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: ReportGranularity;
    includeDrafts?: boolean;
  }): Promise<ExecutiveSummaryReport> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('start_date', params.startDate);
    if (params?.endDate) query.set('end_date', params.endDate);
    if (params?.granularity) query.set('granularity', params.granularity);
    if (params?.includeDrafts) query.set('include_drafts', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/executive-summary${qs}`);
  },

  async getSalesReport(
    startDate?: string,
    endDate?: string,
    granularity?: ReportGranularity,
    includeDrafts?: boolean
  ): Promise<SalesReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    if (granularity) query.set('granularity', granularity);
    if (includeDrafts) query.set('include_drafts', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/sales${qs}`);
  },

  async getReceivablesAging(asOf?: string): Promise<ReceivablesAgingReport> {
    const qs = asOf ? `?as_of=${encodeURIComponent(asOf)}` : '';
    return apiClient.get(`/reports/receivables-aging${qs}`);
  },

  async getPayablesAging(asOf?: string): Promise<PayablesAgingReport> {
    const qs = asOf ? `?as_of=${encodeURIComponent(asOf)}` : '';
    return apiClient.get(`/reports/payables-aging${qs}`);
  },

  async getProfitability(
    startDate?: string,
    endDate?: string,
    includeDrafts?: boolean
  ): Promise<ProfitabilityReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    if (includeDrafts) query.set('include_drafts', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/profitability${qs}`);
  },

  async getCashFlow(
    startDate?: string,
    endDate?: string,
    granularity?: ReportGranularity
  ): Promise<CashFlowReport> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    if (granularity) query.set('granularity', granularity);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/reports/cash-flow${qs}`);
  },
};
