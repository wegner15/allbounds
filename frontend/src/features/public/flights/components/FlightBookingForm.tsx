import React, { useState } from 'react';
import { Plane, Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubmitFlightBooking } from '../../../../lib/hooks/useFlightBookings';

interface FlightFormProps {
    onSuccess: () => void;
}

const FlightBookingForm: React.FC<FlightFormProps> = ({ onSuccess }) => {
    const submitBooking = useSubmitFlightBooking();

    // Form State
    const [tripType, setTripType] = useState('round_trip');
    const [purpose, setPurpose] = useState('');
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });

    // Add-ons
    const [addOns, setAddOns] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        departure_city: '',
        destination_city: '',
        departure_date: '',
        return_date: '',
        preferred_departure_time: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        preferred_contact_method: '',
        travel_budget_range: '',
        is_flexible_dates: false,
    });

    // Dynamic passenger details array
    const [passengerDetails, setPassengerDetails] = useState<any[]>([{
        full_name: '',
        dob: '',
        gender: '',
        nationality: '',
        passport_number: '',
        passport_expiry: '',
        special_assistance: false,
        seat_preference: '',
        meal_preference: '',
        passenger_type: 'adult',
    }]);

    const handlePassengerCountChange = (type: 'adults' | 'children' | 'infants', value: number) => {
        const newValue = Math.max(type === 'adults' ? 1 : 0, value);

        setPassengers(prev => {
            const nextPassengers = { ...prev, [type]: newValue };
            const totalCount = nextPassengers.adults + nextPassengers.children + nextPassengers.infants;

            setPassengerDetails(prevDetails => {
                const newArr = [...prevDetails];
                if (totalCount > newArr.length) {
                    for (let i = newArr.length; i < totalCount; i++) {
                        newArr.push({
                            full_name: '', dob: '', gender: '', nationality: '', passport_number: '', passport_expiry: '', special_assistance: false, seat_preference: '', meal_preference: '', passenger_type: type === 'adults' ? 'adult' : type === 'children' ? 'child' : 'infant',
                        });
                    }
                } else if (totalCount < newArr.length) {
                    return newArr.slice(0, totalCount);
                }
                return newArr;
            });

            return nextPassengers;
        });
    };

    const handlePassengerDetailChange = (index: number, field: string, value: any) => {
        setPassengerDetails(prev => {
            const newArr = [...prev];
            newArr[index] = { ...newArr[index], [field]: value };
            return newArr;
        });
    };

    const toggleAddOn = (service: string) => {
        setAddOns(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            trip_type: tripType,
            ...formData,
            return_date: tripType === 'round_trip' ? formData.return_date : null,
            purpose,
            adults: passengers.adults,
            children: passengers.children,
            infants: passengers.infants,
            add_on_services: addOns,
            passengers: passengerDetails,
        };

        submitBooking.mutate(payload as any, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {submitBooking.isError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                    <p>There was an error processing your request. Please check the required fields and submit again.</p>
                </div>
            )}

            {/* 1. Trip Details */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
                <h3 className="text-xl font-bold text-charcoal mb-6 pb-4 border-b">1. Trip Details</h3>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        {[
                            { id: 'one_way', label: 'One Way' },
                            { id: 'round_trip', label: 'Round Trip' },
                            { id: 'multi_city', label: 'Multi-City' }
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setTripType(type.id)}
                                className={`px-6 py-2 rounded-full font-medium transition-colors ${tripType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-primary" /> Departure City / Airport *
                            </label>
                            <input type="text" required value={formData.departure_city} onChange={e => setFormData({ ...formData, departure_city: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-primary" /> Destination City / Airport *
                            </label>
                            <input type="text" required value={formData.destination_city} onChange={e => setFormData({ ...formData, destination_city: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <Calendar className="w-4 h-4 text-primary" /> Departure Date *
                            </label>
                            <input type="date" required value={formData.departure_date} onChange={e => setFormData({ ...formData, departure_date: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>

                        {tripType === 'round_trip' && (
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-primary" /> Return Date *
                                </label>
                                <input type="date" required value={formData.return_date} onChange={e => setFormData({ ...formData, return_date: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Preferred Time
                            </label>
                            <select value={formData.preferred_departure_time} onChange={e => setFormData({ ...formData, preferred_departure_time: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none appearance-none">
                                <option value="">Select Time</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Flexible Dates?
                            </label>
                            <div className="flex items-center h-[50px] px-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <input type="checkbox" checked={formData.is_flexible_dates} onChange={e => setFormData({ ...formData, is_flexible_dates: e.target.checked })} className="w-5 h-5 text-primary rounded focus:ring-primary mr-3" />
                                <span className="text-sm text-gray-700">±1–3 days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        <Users className="w-4 h-4 text-primary" /> Number of Passengers
                    </label>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center">
                            <span className="mr-3 font-medium text-charcoal">Adults (12+)</span>
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => handlePassengerCountChange('adults', passengers.adults - 1)} className="px-3 py-1 hover:bg-gray-200 rounded-l-lg">-</button>
                                <span className="px-4 py-1 font-bold">{passengers.adults}</span>
                                <button type="button" onClick={() => handlePassengerCountChange('adults', passengers.adults + 1)} className="px-3 py-1 hover:bg-gray-200 rounded-r-lg">+</button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-3 font-medium text-charcoal">Children (2-11)</span>
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => handlePassengerCountChange('children', passengers.children - 1)} className="px-3 py-1 hover:bg-gray-200 rounded-l-lg">-</button>
                                <span className="px-4 py-1 font-bold">{passengers.children}</span>
                                <button type="button" onClick={() => handlePassengerCountChange('children', passengers.children + 1)} className="px-3 py-1 hover:bg-gray-200 rounded-r-lg">+</button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-3 font-medium text-charcoal">Infants (0-2)</span>
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                <button type="button" onClick={() => handlePassengerCountChange('infants', passengers.infants - 1)} className="px-3 py-1 hover:bg-gray-200 rounded-l-lg">-</button>
                                <span className="px-4 py-1 font-bold">{passengers.infants}</span>
                                <button type="button" onClick={() => handlePassengerCountChange('infants', passengers.infants + 1)} className="px-3 py-1 hover:bg-gray-200 rounded-r-lg">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Passenger Details */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
                <h3 className="text-xl font-bold text-charcoal mb-6 pb-4 border-b">2. Passenger Details</h3>

                <div className="space-y-8">
                    {passengerDetails.map((passenger, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-primary mb-4 flex items-center">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">{index + 1}</span>
                                Traveler Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name (As per passport) *</label>
                                    <input type="text" required value={passenger.full_name} onChange={e => handlePassengerDetailChange(index, 'full_name', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date of Birth *</label>
                                    <input type="date" required value={passenger.dob} onChange={e => handlePassengerDetailChange(index, 'dob', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Passenger Type *</label>
                                    <select required value={passenger.passenger_type} onChange={e => handlePassengerDetailChange(index, 'passenger_type', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none appearance-none">
                                        <option value="adult">Adult (12+)</option>
                                        <option value="child">Child (2-11)</option>
                                        <option value="infant">Infant (0-2)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nationality</label>
                                    <input type="text" value={passenger.nationality} onChange={e => handlePassengerDetailChange(index, 'nationality', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Passport Number</label>
                                    <input type="text" value={passenger.passport_number} onChange={e => handlePassengerDetailChange(index, 'passport_number', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Passport Expiry</label>
                                    <input type="date" value={passenger.passport_expiry} onChange={e => handlePassengerDetailChange(index, 'passport_expiry', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
                                </div>

                                <div className="mt-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seat Pref.</label>
                                    <select value={passenger.seat_preference} onChange={e => handlePassengerDetailChange(index, 'seat_preference', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none appearance-none">
                                        <option value="">No Preference</option><option value="Window">Window</option><option value="Aisle">Aisle</option>
                                    </select>
                                </div>
                                <div className="mt-2 text-sm flex items-center pt-6">
                                    <input type="checkbox" checked={passenger.special_assistance} onChange={e => handlePassengerDetailChange(index, 'special_assistance', e.target.checked)} className="w-4 h-4 text-primary rounded mr-2" />
                                    <span className="text-gray-700 font-medium">Requires Special Assistance</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Purpose & Contact */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
                <h3 className="text-xl font-bold text-charcoal mb-6 pb-4 border-b">3. Options & Contact Information</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-3">Why are you requesting this booking? *</label>
                            <div className="space-y-3">
                                {[
                                    { id: 'visa_reservation', label: 'Visa Application (Reservation Only)' },
                                    { id: 'confirmed_ticket', label: 'Confirmed Ticket Purchase' },
                                    { id: 'price_quote', label: 'Price Quote Only' },
                                    { id: 'travel_planning', label: 'Travel Planning' }
                                ].map(option => (
                                    <label key={option.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input type="radio" name="purpose" required checked={purpose === option.id} onChange={() => setPurpose(option.id)} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary mr-3" />
                                        <span className="text-gray-700 font-medium">{option.label}</span>
                                    </label>
                                ))}
                            </div>

                            {purpose === 'visa_reservation' && (
                                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 mr-3 shrink-0" />
                                    <p className="text-sm text-charcoal font-medium">This itinerary is valid for embassy submission. We will provide a confirmed reservation document without requiring full payment upfront.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-3">Add-on Services</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Travel Insurance', 'Airport Transfer', 'Hotel Booking', 'Visa Assistance', 'Express Processing'].map(service => (
                                    <label key={service} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input type="checkbox" checked={addOns.includes(service)} onChange={() => toggleAddOn(service)} className="w-4 h-4 text-primary rounded mr-3" />
                                        <span className="text-sm text-gray-700">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-charcoal mb-1">Primary Contact Details *</label>

                        <div>
                            <input type="text" placeholder="Full Name" required value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>
                        <div>
                            <input type="email" placeholder="Email Address" required value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>
                        <div>
                            <input type="tel" placeholder="Phone Number (WhatsApp preferred)" required value={formData.contact_phone} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none" />
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Preferred Contact Method</label>
                            <div className="flex gap-4">
                                {['whatsapp', 'email', 'call'].map(method => (
                                    <label key={method} className="flex items-center cursor-pointer">
                                        <input type="radio" required name="contact_method" checked={formData.preferred_contact_method === method} onChange={() => setFormData({ ...formData, preferred_contact_method: method })} className="w-4 h-4 text-primary border-gray-300 focus:ring-primary mr-2" />
                                        <span className="text-sm text-gray-700 capitalize">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col items-center pt-4">
                <button
                    type="submit"
                    disabled={submitBooking.isPending}
                    className="bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all w-full md:w-auto min-w-[300px] disabled:opacity-50"
                >
                    {submitBooking.isPending ? 'Submitting Request...' : 'Submit Booking Request'}
                </button>
                <p className="text-xs text-gray-500 mt-4 text-center max-w-sm">
                    By submitting this form, you agree to our booking terms and conditions. We typically respond within 2-4 hours.
                </p>
            </div>
        </form>
    );
};

export default FlightBookingForm;
