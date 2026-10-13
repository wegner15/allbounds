import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getEmailLogs } from '../api/emailLogs';
import type { PaginatedEmailLogsResponse, GetEmailLogsParams } from '../api/emailLogs';

export const useEmailLogs = (params: GetEmailLogsParams = { page: 1, limit: 20 }) => {
    return useQuery<PaginatedEmailLogsResponse, Error>({
        queryKey: ['emailLogs', params.page, params.limit, params.search, params.status],
        queryFn: () => getEmailLogs(params),
        placeholderData: keepPreviousData,
    });
};
