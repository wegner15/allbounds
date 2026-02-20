import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/home-heros/hero2.webp"
                        alt="About Allbound Vacations"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
                </div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 drop-shadow-lg">
                        About Us
                    </h1>
                </div>
            </section>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            </li>
                            <li><span className="mx-2">&gt;</span></li>
                            <li className="text-gray-900 font-medium" aria-current="page">About Us</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Description Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <p className="text-lg text-gray-700 leading-relaxed font-light">
                                <strong className="font-semibold text-primary">Allbound Vacations</strong> is a premier bespoke travel company specializing in tailor-made luxury trips and personalized travel experiences across Africa and beyond.
                                We design custom itineraries that combine expert local knowledge, seamless logistics, and authentic experience, ensuring every journey is unique, stress-free, and unforgettable. We curate experiences built entirely around your interests, timeline, and budget.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed font-light">
                                Our simple three-step approach; <span className="font-medium text-charcoal">Browse</span>, <span className="font-medium text-charcoal">Create</span>, and <span className="font-medium text-charcoal">Customize</span>, makes planning effortless. Whether you’re seeking African safaris, luxury holidays, honeymoons, family holidays, multi-centre tours, destination weddings, sports travel, cruises, religious tours, or corporate incentives and conferences, our travel consultants handle every detail with precision. We carefully select accommodations, transfers, guided wildlife experiences, and exclusive attractions to ensure exceptional comfort and value.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed font-light">
                                Our tailor-made trips offer flexibility, transparency, and personalized service from real travel experts who understand your vision. With vetted partners and 24/7 support before, during, and after your trip, your safety and satisfaction always come first.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed font-light">
                                Trusted by repeat clients and referrals, Allbound Vacations is your gateway to Africa, Asia, Europe, the Middle East, and the Indian Ocean Islands. Discover bespoke safaris, luxury holidays, and unforgettable adventures designed just for you. Your perfect journey begins here.
                            </p>
                        </div>
                        <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="/home-heros/hero3.webp"
                                alt="Travel experiences"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-6">Why Choose Us</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                            In a world full of travel options, choosing the right partner makes all the difference. Here’s why discerning travelers trust us to design their perfect journeys.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="order-2 lg:order-1 relative h-[600px] rounded-2xl overflow-hidden shadow-2xl lg:sticky lg:top-24">
                            <img
                                src="/home-heros/hero1.jpeg"
                                alt="Why choose us"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                        <div className="order-1 lg:order-2 space-y-10">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">🌍</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Tailor-Made Experiences</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        No two travelers are the same. We craft personalized itineraries that match your interests, budget, and travel style - whether it’s a luxury safari, beach escape, city break, or group adventure.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">🛡️</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Safety & Reliability First</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        Your safety is our priority. We work only with vetted hotels, transport providers, and guides who meet strict safety and quality standards, so you travel with confidence and peace of mind.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Transparent Pricing & Best Value</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        We offer competitive rates and exceptional value, ensuring you get the best experience for your investment.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">🤝</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Dedicated Travel Experts</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        You’re not booking with a system - you’re working with experienced travel professionals who understand destinations firsthand and provide honest, expert advice.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">📞</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">24/7 Support - Before, During & After Your Trip</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        Travel doesn’t follow office hours, and neither do we. Our team is available whenever you need assistance, from planning to your return home.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">✈️</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Seamless End-to-End Planning</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        Flights, transfers, accommodations, activities - we handle every detail so you can focus on enjoying your journey stress-free.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <span className="text-3xl">⭐</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-charcoal mb-2 font-playfair">Trusted by Happy Travelers</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        Our growing base of repeat clients and referrals speaks for itself. We build long-term relationships, not just bookings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutUsPage;
