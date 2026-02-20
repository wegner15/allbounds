import { apiClient } from '../../lib/api';

export interface VisaApplicationCreate {
    destination_country: string
    visa_type: string
    nationality: string
    intended_travel_date: string

    full_name: string
    dob: string
    passport_number: string
    passport_expiry: string
    marital_status: string
    current_residence: string
    email: string
    phone: string

    purpose_of_travel: string
    travel_from_date: string
    travel_to_date: string
    accommodation_type: string
    flight_reservation_id?: number | null
}

export const submitVisaApplication = async (data: VisaApplicationCreate) => {
    const response = await apiClient.post<any>('/visa-applications/', data);
    return response;
};
