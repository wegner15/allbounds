import { apiClient } from '../api';
import type {
  Currency,
  CompanyFinanceSettings,
  Invoice,
  InvoiceCreateRequest,
  InvoiceUpdateRequest,
  PaymentReceipt,
  PaymentReceiptCreateRequest,
  TravelVoucher,
  TravelVoucherCreateRequest,
  TravelVoucherUpdateRequest,
  FinanceDashboardStats,
  PublicVoucherVerificationResponse,
  PublicReceiptVerificationResponse
} from '../types/finance';

export const financeApi = {
  // ==========================================
  // DASHBOARD & SETTINGS
  // ==========================================
  async getStats(): Promise<FinanceDashboardStats> {
    return apiClient.get<FinanceDashboardStats>('/finance/stats');
  },

  async getSettings(): Promise<CompanyFinanceSettings> {
    return apiClient.get<CompanyFinanceSettings>('/finance/settings');
  },

  async updateSettings(data: Partial<CompanyFinanceSettings>): Promise<CompanyFinanceSettings> {
    return apiClient.put<CompanyFinanceSettings>('/finance/settings', data);
  },

  // ==========================================
  // CURRENCIES
  // ==========================================
  async getCurrencies(activeOnly = true): Promise<Currency[]> {
    return apiClient.get<Currency[]>(`/finance/currencies?active_only=${activeOnly}`);
  },

  async createCurrency(data: Omit<Currency, 'id'>): Promise<Currency> {
    return apiClient.post<Currency>('/finance/currencies', data);
  },

  async updateCurrency(id: number, data: Partial<Currency>): Promise<Currency> {
    return apiClient.put<Currency>(`/finance/currencies/${id}`, data);
  },

  // ==========================================
  // INVOICES
  // ==========================================
  async getInvoices(params: {
    skip?: number;
    limit?: number;
    status?: string;
    client_search?: string;
    currency?: string;
  } = {}): Promise<{ items: Invoice[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.client_search) query.set('client_search', params.client_search);
    if (params.currency) query.set('currency', params.currency);

    const queryString = query.toString();
    const endpoint = `/finance/invoices${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<{ items: Invoice[]; total: number; skip: number; limit: number }>(endpoint);
  },

  async getInvoice(id: number): Promise<Invoice> {
    return apiClient.get<Invoice>(`/finance/invoices/${id}`);
  },

  async getNextInvoiceNumber(): Promise<{ invoice_number: string }> {
    return apiClient.get<{ invoice_number: string }>('/finance/invoices/next-number');
  },

  async getInvoiceByToken(token: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/finance/invoices/by-token/${token}`);
  },

  async createInvoice(data: InvoiceCreateRequest): Promise<Invoice> {
    return apiClient.post<Invoice>('/finance/invoices', data);
  },

  async createInvoiceFromBooking(data: {
    booking_id: number;
    due_date?: string;
    currency?: string;
    payment_terms?: string;
    notes?: string;
  }): Promise<Invoice> {
    return apiClient.post<Invoice>('/finance/invoices/from-booking', data);
  },

  async updateInvoice(id: number, data: InvoiceUpdateRequest): Promise<Invoice> {
    return apiClient.put<Invoice>(`/finance/invoices/${id}`, data);
  },

  async deleteInvoice(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/finance/invoices/${id}`);
  },

  async sendInvoiceEmail(id: number, data: {
    recipient_email: string;
    recipient_name?: string;
    subject?: string;
    message?: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/finance/invoices/${id}/send-email`, data);
  },

  // ==========================================
  // PAYMENT RECEIPTS
  // ==========================================
  async getReceipts(params: {
    skip?: number;
    limit?: number;
    invoice_id?: number;
  } = {}): Promise<{ items: PaymentReceipt[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.invoice_id) query.set('invoice_id', params.invoice_id.toString());

    const queryString = query.toString();
    const endpoint = `/finance/receipts${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<{ items: PaymentReceipt[]; total: number; skip: number; limit: number }>(endpoint);
  },

  async getReceipt(id: number): Promise<PaymentReceipt> {
    return apiClient.get<PaymentReceipt>(`/finance/receipts/${id}`);
  },

  async createReceipt(data: PaymentReceiptCreateRequest): Promise<PaymentReceipt> {
    return apiClient.post<PaymentReceipt>('/finance/receipts', data);
  },

  async sendReceiptEmail(id: number, data: {
    recipient_email: string;
    recipient_name?: string;
    subject?: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/finance/receipts/${id}/send-email`, data);
  },

  // ==========================================
  // TRAVEL VOUCHERS
  // ==========================================
  async getVouchers(params: {
    skip?: number;
    limit?: number;
    voucher_type?: string;
    status?: string;
    supplier_search?: string;
  } = {}): Promise<{ items: TravelVoucher[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.voucher_type && params.voucher_type !== 'all') query.set('voucher_type', params.voucher_type);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.supplier_search) query.set('supplier_search', params.supplier_search);

    const queryString = query.toString();
    const endpoint = `/finance/vouchers${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<{ items: TravelVoucher[]; total: number; skip: number; limit: number }>(endpoint);
  },

  async getVoucher(id: number): Promise<TravelVoucher> {
    return apiClient.get<TravelVoucher>(`/finance/vouchers/${id}`);
  },

  async createVoucher(data: TravelVoucherCreateRequest): Promise<TravelVoucher> {
    return apiClient.post<TravelVoucher>('/finance/vouchers', data);
  },

  async createVoucherFromBooking(data: {
    booking_id: number;
    voucher_type?: string;
    supplier_details?: any;
    issue_date?: string;
  }): Promise<TravelVoucher> {
    return apiClient.post<TravelVoucher>('/finance/vouchers/from-booking', data);
  },

  async updateVoucher(id: number, data: TravelVoucherUpdateRequest): Promise<TravelVoucher> {
    return apiClient.put<TravelVoucher>(`/finance/vouchers/${id}`, data);
  },

  async sendVoucherEmail(id: number, data: {
    recipient_email: string;
    recipient_name?: string;
    subject?: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/finance/vouchers/${id}/send-email`, data);
  },

  // ==========================================
  // PUBLIC VERIFICATION
  // ==========================================
  async verifyVoucher(code: string): Promise<PublicVoucherVerificationResponse> {
    return apiClient.get<PublicVoucherVerificationResponse>(`/finance/verify/voucher/${code}`);
  },

  async verifyReceipt(code: string): Promise<PublicReceiptVerificationResponse> {
    return apiClient.get<PublicReceiptVerificationResponse>(`/finance/verify/receipt/${code}`);
  },
};
