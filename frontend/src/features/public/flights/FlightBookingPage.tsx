import React from 'react';
import { Plane, Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

const FlightBookingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] bg-charcoal overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Flight Booking"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal/80"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4">
                        Fly to Your Dream Destination
                    </h1>
                    <p className="text-xl text-white/90 font-lato max-w-2xl mx-auto">
                        Experience premium air travel at the best prices. We partner with top airlines to give you a seamless journey.
                    </p>
                </div>
            </div>

            {/* Booking Form Container */}
            <div className="container mx-auto px-4 -mt-24 relative z-10 pb-20">
                <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <Plane className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal">Book Your Flight</h2>
                            <p className="text-sm text-gray-500">Find and compare best flight deals</p>
                        </div>
                    </div>

                    <form className="space-y-8">
                        {/* Trip Type */}
                        <div className="flex flex-wrap gap-4">
                            <button type="button" className="px-6 py-2 rounded-full font-medium bg-primary text-white">Round Trip</button>
                            <button type="button" className="px-6 py-2 rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">One Way</button>
                            <button type="button" className="px-6 py-2 rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Multi-city</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* From */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Leaving From
                                </label>
                                <input
                                    type="text"
                                    placeholder="City or Airport"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Going To
                                </label>
                                <input
                                    type="text"
                                    placeholder="City or Airport"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Dates
                                </label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>

                            {/* Passengers */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <Users className="w-4 h-4 text-primary" />
                                    Passengers
                                </label>
                                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none appearance-none">
                                    <option>1 Adult, Economy</option>
                                    <option>2 Adults, Economy</option>
                                    <option>1 Adult, Business</option>
                                    <option>2 Adults, Business</option>
                                    <option>Family (2+2), Economy</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                            >
                                Search Flights
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Why Book With Us */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="text-center space-y-4">
                        <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                            <Plane className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">Global Network</h3>
                        <p className="text-gray-600">Access to over 500 airlines worldwide with the best connection possibilities.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">Flexible Bookings</h3>
                        <p className="text-gray-600">Easy changes and cancellations on most flight reservations.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">24/7 Support</h3>
                        <p className="text-gray-600">Our dedicated travel consultants are always here to help with your journey.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightBookingPage;
