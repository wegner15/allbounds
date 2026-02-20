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

export const getEmailLogs = async (skip: number = 0, limit: number = 100): Promise<EmailLog[]> => {
    const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
    }).toString();

    return await apiClient.get<EmailLog[]>(`/email-logs/?${queryParams}`);
};
