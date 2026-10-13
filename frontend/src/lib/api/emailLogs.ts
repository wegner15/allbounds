import { apiClient } from '../../lib/api';

export interface EmailLog {
    id: number;
    recipient: string;
    subject: string;
    payload: any;
    response_status: number | null;
    response_data: any | null;
    created_at: string;
}

export interface PaginatedEmailLogsResponse {
    items: EmailLog[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface GetEmailLogsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'success' | 'failed' | string;
}

export const getEmailLogs = async (
    params: GetEmailLogsParams | number = 1,
    limitParam: number = 20
): Promise<PaginatedEmailLogsResponse> => {
    let page = 1;
    let limit = 20;
    let search = '';
    let status = '';

    if (typeof params === 'number') {
        page = params === 0 ? 1 : params;
        limit = limitParam;
    } else {
        page = params.page || 1;
        limit = params.limit || 20;
        search = params.search || '';
        status = params.status && params.status !== 'all' ? params.status : '';
    }

    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search.trim()) {
        queryParams.append('search', search.trim());
    }
    if (status) {
        queryParams.append('status', status);
    }

    const res = await apiClient.get<any>(`/email-logs/?${queryParams.toString()}`);

    // Gracefully handle raw array if ever received
    if (Array.isArray(res)) {
        return {
            items: res,
            total: res.length,
            page: 1,
            size: res.length,
            pages: 1,
        };
    }

    return res;
};
