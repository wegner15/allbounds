import { apiClient } from '../../lib/api';

export interface FlightPassengerCreate {
    full_name: string;
    dob: string;
    gender?: string;
    nationality?: string;
    passport_number?: string;
    passport_expiry?: string;
    special_assistance: boolean;
    seat_preference?: string;
    meal_preference?: string;
    passenger_type: string;
}

export interface FlightBookingCreate {
    trip_type: string;
    departure_city: string;
    destination_city: string;
    departure_date: string;
    return_date?: string | null;
    preferred_departure_time?: string;

    adults: number;
    children: number;
    infants: number;

    purpose: string;

    contact_name: string;
    contact_email: string;
    contact_phone: string;
    preferred_contact_method?: string;

    travel_budget_range?: string;
    is_flexible_dates: boolean;

    add_on_services?: string[];

    passengers: FlightPassengerCreate[];
}

export const submitFlightBooking = async (data: FlightBookingCreate) => {
    return await apiClient.post<any>('/flight-bookings/', data);
};
