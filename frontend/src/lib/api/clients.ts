import { apiClient } from '../api';
import type { Client, ClientStatement } from '../types/finance';

export const clientsApi = {
  async getClients(params: {
    skip?: number;
    limit?: number;
    search?: string;
    client_type?: string;
    is_active?: boolean;
  } = {}): Promise<{ items: Client[]; total: number; skip: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set('skip', params.skip.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.client_type && params.client_type !== 'all') query.set('client_type', params.client_type);
    if (params.is_active !== undefined) query.set('is_active', params.is_active.toString());

    return apiClient.get(`/clients?${query.toString()}`);
  },

  async getClient(id: number): Promise<Client> {
    return apiClient.get(`/clients/${id}`);
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    return apiClient.post('/clients', data);
  },

  async updateClient(id: number, data: Partial<Client>): Promise<Client> {
    return apiClient.put(`/clients/${id}`, data);
  },

  async deleteClient(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/clients/${id}`);
  },

  async getStatement(id: number, startDate?: string, endDate?: string): Promise<ClientStatement> {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/clients/${id}/statement${qs}`);
  },
};
