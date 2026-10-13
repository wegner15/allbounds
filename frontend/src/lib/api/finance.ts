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
  PaymentVoucher,
  PaymentVoucherCreateRequest,
  PaymentVoucherUpdateRequest,
  PaymentVoucherSignRequest,
  PublicPaymentVoucherSignView,
  FinanceDashboardStats,
  InvoiceProfitability,
  PublicVoucherVerificationResponse,
  PublicReceiptVerificationResponse,
  StaffMember
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

  async deleteCurrency(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/finance/currencies/${id}`);
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

  async getInvoiceProfitability(id: number): Promise<InvoiceProfitability> {
    return apiClient.get<InvoiceProfitability>(`/finance/invoices/${id}/profitability`);
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

  async cancelInvoice(id: number): Promise<Invoice> {
    try {
      return await apiClient.post<Invoice>(`/finance/invoices/${id}/cancel`, {});
    } catch {
      return await apiClient.put<Invoice>(`/finance/invoices/${id}`, { invoice_status: 'cancelled' });
    }
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
  // STAFF / EMPLOYEE REGISTRY
  // ==========================================
  async getStaff(activeOnly = false): Promise<StaffMember[]> {
    return apiClient.get<StaffMember[]>(`/finance/staff?active_only=${activeOnly}`);
  },

  async saveStaff(member: StaffMember): Promise<StaffMember[]> {
    return apiClient.post<StaffMember[]>('/finance/staff', member);
  },

  async deleteStaff(id: string): Promise<StaffMember[]> {
    return apiClient.delete<StaffMember[]>(`/finance/staff/${encodeURIComponent(id)}`);
  },

  // ==========================================
  // PAYMENT / EXPENSE AUTHORIZATION VOUCHERS
  // ==========================================
  async getPaymentVouchers(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    category?: string;
    employee_id?: number;
    staff_id?: string;
    booking_id?: number;
    search?: string;
  }): Promise<{ items: PaymentVoucher[]; total: number; skip: number; limit: number }> {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.append('skip', String(params.skip));
    if (params?.limit !== undefined) q.append('limit', String(params.limit));
    if (params?.status) q.append('status', params.status);
    if (params?.category) q.append('category', params.category);
    if (params?.employee_id) q.append('employee_id', String(params.employee_id));
    if (params?.staff_id) q.append('staff_id', params.staff_id);
    if (params?.booking_id) q.append('booking_id', String(params.booking_id));
    if (params?.search) q.append('search', params.search);
    return apiClient.get<{ items: PaymentVoucher[]; total: number; skip: number; limit: number }>(
      `/finance/payment-vouchers?${q.toString()}`
    );
  },

  async createPaymentVoucher(data: PaymentVoucherCreateRequest): Promise<PaymentVoucher> {
    return apiClient.post<PaymentVoucher>('/finance/payment-vouchers', data);
  },

  async getPaymentVoucher(id: number): Promise<PaymentVoucher> {
    return apiClient.get<PaymentVoucher>(`/finance/payment-vouchers/${id}`);
  },

  async updatePaymentVoucher(id: number, data: PaymentVoucherUpdateRequest): Promise<PaymentVoucher> {
    return apiClient.put<PaymentVoucher>(`/finance/payment-vouchers/${id}`, data);
  },

  async getPaymentVoucherForSigning(token: string): Promise<PublicPaymentVoucherSignView> {
    return apiClient.get<PublicPaymentVoucherSignView>(`/finance/payment-vouchers/sign/${token}`);
  },

  async signPaymentVoucher(token: string, data: PaymentVoucherSignRequest): Promise<PublicPaymentVoucherSignView> {
    return apiClient.post<PublicPaymentVoucherSignView>(`/finance/payment-vouchers/sign/${token}`, data);
  },

  async sendPaymentVoucherEmail(id: number, data: {
    recipient_email: string;
    recipient_name?: string;
    subject?: string;
    message?: string;
  }): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/finance/payment-vouchers/${id}/send-email`, data);
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

  async verifyPaymentVoucher(code: string): Promise<any> {
    return apiClient.get<any>(`/finance/verify/payment-voucher/${code}`);
  },
};

