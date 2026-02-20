import { useQuery } from '@tanstack/react-query';
import { getEmailLogs } from '../api/emailLogs';
import type { EmailLog } from '../api/emailLogs';

export const useEmailLogs = (skip: number = 0, limit: number = 100) => {
    return useQuery<EmailLog[], Error>({
        queryKey: ['emailLogs', skip, limit],
        queryFn: () => getEmailLogs(skip, limit),
    });
};
