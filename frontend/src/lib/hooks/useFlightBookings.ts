import { useMutation } from '@tanstack/react-query';
import { submitFlightBooking } from '../api/flightBookings';
import type { FlightBookingCreate } from '../api/flightBookings';

export const useSubmitFlightBooking = () => {
    return useMutation({
        mutationFn: (data: FlightBookingCreate) => submitFlightBooking(data),
    });
};
