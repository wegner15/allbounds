import { useMutation } from '@tanstack/react-query';
import { submitVisaApplication } from '../api/visaApplications';
import type { VisaApplicationCreate } from '../api/visaApplications';

export const useSubmitVisaApplication = () => {
    return useMutation({
        mutationFn: (data: VisaApplicationCreate) => submitVisaApplication(data),
    });
};
