import React, { useState } from 'react';
import { Plane, Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import FlightBookingForm from './components/FlightBookingForm';

const FlightBookingPage: React.FC = () => {
    const [isSuccess, setIsSuccess] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[400px] bg-charcoal overflow-hidden">
                <img
                    src="/fly-book-hero.jpeg"
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
                <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-10 mb-8">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <Plane className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal">Book Your Flight</h2>
                            <p className="text-sm text-gray-500">Find and compare best flight deals</p>
                        </div>
                    </div>

                    {isSuccess ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-3xl font-playfair font-bold text-charcoal mb-4">Request Received!</h2>
                            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                Thank you for submitting your flight booking request. Our agents will process your itinerary and contact you shortly.
                            </p>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors duration-300"
                            >
                                Book Another Flight
                            </button>
                        </div>
                    ) : (
                        <FlightBookingForm onSuccess={() => setIsSuccess(true)} />
                    )}
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
