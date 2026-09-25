import { apiClient } from '../api';
import type { Supplier, SupplierBill, SupplierPayment, SupplierLedger } from '../types/finance';

export const suppliersApi = {
  // Suppliers CRUD
  async getSuppliers(params: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
  } = {}): Promise<{ items: Supplier[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.is_active !== undefined) query.set('is_active', params.is_active.toString());

    return apiClient.get(`/suppliers?${query.toString()}`);
  },

  async getSupplier(id: number): Promise<Supplier> {
    return apiClient.get(`/suppliers/${id}`);
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    return apiClient.post('/suppliers', data);
  },

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
    return apiClient.put(`/suppliers/${id}`, data);
  },

  async deleteSupplier(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/suppliers/${id}`);
  },

  async getLedger(id: number, startDate?: string, endDate?: string): Promise<SupplierLedger> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/suppliers/${id}/ledger${qs}`);
  },

  // Bills (Payables)
  async getNextBillNumber(): Promise<{ bill_number: string }> {
    return apiClient.get('/suppliers/next-bill-number');
  },

  async getNextPaymentNumber(): Promise<{ payment_number: string }> {
    return apiClient.get('/suppliers/next-payment-number');
  },

  async getBills(params: {
    skip?: number;
    limit?: number;
    supplier_id?: number;
    invoice_id?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{ items: SupplierBill[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.supplier_id) query.set('supplier_id', params.supplier_id.toString());
    if (params.invoice_id) query.set('invoice_id', params.invoice_id.toString());
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    return apiClient.get(`/suppliers/bills?${query.toString()}`);
  },

  async createBill(data: Partial<SupplierBill>): Promise<SupplierBill> {
    return apiClient.post('/suppliers/bills', data);
  },

  async getBill(id: number): Promise<SupplierBill> {
    return apiClient.get(`/suppliers/bills/${id}`);
  },

  async updateBill(id: number, data: Partial<SupplierBill>): Promise<SupplierBill> {
    return apiClient.put(`/suppliers/bills/${id}`, data);
  },

  // Disbursements / Payments
  async createPayment(data: Partial<SupplierPayment>): Promise<SupplierPayment> {
    return apiClient.post('/suppliers/payments', data);
  },
};
