import React, { useState, useEffect } from 'react';
import { useSubmitVisaApplication } from '../../../../lib/hooks/useVisaApplications';
import { useCountries } from '../../../../lib/hooks/useDestinations';

interface VisaFormProps {
    onSuccess: () => void;
}

const VisaForm: React.FC<VisaFormProps> = ({ onSuccess }) => {
    const { data: countries } = useCountries();
    const submitVisa = useSubmitVisaApplication();

    const [formData, setFormData] = useState({
        destination_country: '',
        visa_type: '',
        nationality: '',
        intended_travel_date: '',

        full_name: '',
        dob: '',
        passport_number: '',
        passport_expiry: '',
        marital_status: '',
        current_residence: '',
        email: '',
        phone: '',

        purpose_of_travel: '',
        travel_from_date: '',
        travel_to_date: '',
        accommodation_type: '',
    });

    const [lengthOfStay, setLengthOfStay] = useState<number | null>(null);

    // Auto-calculate length of stay
    useEffect(() => {
        if (formData.travel_from_date && formData.travel_to_date) {
            const from = new Date(formData.travel_from_date);
            const to = new Date(formData.travel_to_date);
            if (to >= from) {
                const diffTime = Math.abs(to.getTime() - from.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setLengthOfStay(diffDays);
            } else {
                setLengthOfStay(null);
            }
        } else {
            setLengthOfStay(null);
        }
    }, [formData.travel_from_date, formData.travel_to_date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitVisa.mutate(formData, {
            onSuccess: () => {
                onSuccess();
            },
        });
    };

    const activeCountries = countries?.filter(c => c.is_active) || [];

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
            <h3 className="text-2xl font-playfair font-bold text-charcoal mb-6 border-b pb-4">Visa Application Details</h3>

            {submitVisa.isError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm">
                    There was an error submitting your application. Please check your details and try again.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visa Details Section */}
                <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">1. Travel Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Destination Country *</label>
                            <select
                                name="destination_country"
                                value={formData.destination_country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Destination</option>
                                {activeCountries.map(country => (
                                    <option key={country.id} value={country.name}>{country.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Visa Type *</label>
                            <select
                                name="visa_type"
                                value={formData.visa_type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Visa Type</option>
                                <option value="tourist">Tourist Visa</option>
                                <option value="business">Business Visa</option>
                                <option value="student">Student Visa</option>
                                <option value="work">Work Visa</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Nationality *</label>
                            <input
                                type="text"
                                name="nationality"
                                placeholder="e.g. Kenyan"
                                value={formData.nationality}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Intended Travel Date *</label>
                            <input
                                type="date"
                                name="intended_travel_date"
                                value={formData.intended_travel_date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            />
                        </div>
                    </div>
                </section>

                {/* Personal Details Section */}
                <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">2. Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-charcoal mb-2">Full Name (As per Passport) *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Date of Birth *</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Marital Status *</label>
                            <select
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Passport Number *</label>
                            <input
                                type="text"
                                name="passport_number"
                                value={formData.passport_number}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Passport Expiry Date *</label>
                            <input
                                type="date"
                                name="passport_expiry"
                                value={formData.passport_expiry}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Current Country of Residence *</label>
                            <input
                                type="text"
                                name="current_residence"
                                placeholder="e.g. Kenya"
                                value={formData.current_residence}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Details Section */}
                <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">3. Contact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Telephone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+254 XXX XXX XXX"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            />
                        </div>
                    </div>
                </section>

                {/* Trip Logistics Section */}
                <section>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">4. Visit Logistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-charcoal mb-2">Primary Purpose of Travel *</label>
                            <select
                                name="purpose_of_travel"
                                value={formData.purpose_of_travel}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Purpose</option>
                                <option value="Tourism / Leisure">Tourism / Leisure</option>
                                <option value="Business Meetings / Conference">Business Meetings / Conference</option>
                                <option value="Visiting Family or Friends">Visiting Family or Friends</option>
                                <option value="Medical Treatment">Medical Treatment</option>
                                <option value="Education / Studies">Education / Studies</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Travel Date (From) *</label>
                            <input
                                type="date"
                                name="travel_from_date"
                                value={formData.travel_from_date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">Travel Date (To) *</label>
                            <input
                                type="date"
                                name="travel_to_date"
                                value={formData.travel_to_date}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            />
                        </div>

                        {/* Auto-calculated length of stay */}
                        {lengthOfStay !== null && (
                            <div className="md:col-span-2 bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex items-center">
                                <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span className="text-charcoal font-medium">Estimated Length of Stay: <span className="text-primary font-bold">{lengthOfStay} Days</span></span>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-charcoal mb-2">Accommodation Type *</label>
                            <select
                                name="accommodation_type"
                                value={formData.accommodation_type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Accommodation</option>
                                <option value="Hotel/Resort">Hotel / Resort</option>
                                <option value="Host/Friend">Staying with Host / Friend</option>
                                <option value="Family">Staying with Family</option>
                                <option value="Rented Apartment/Airbnb">Rented Apartment / Airbnb</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="border-t pt-8">
                    <button
                        type="submit"
                        disabled={submitVisa.isPending}
                        className="w-full bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-dark hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {submitVisa.isPending ? 'Processing Application...' : 'Submit Visa Application'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">By submitting this form, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </form>
        </div>
    );
};

export default VisaForm;
