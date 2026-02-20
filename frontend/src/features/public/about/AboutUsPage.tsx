import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Tag, Users, Clock, Plane, Star } from 'lucide-react';
import ThreeStepsSection from '../home/sections/ThreeStepsSection';
import ContactUsCard from '../home/sections/ContactUsCard';

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
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-6">Why Choose Us</h2>
                        <p className="text-lg text-gray-600 font-lato leading-relaxed">
                            With countless options out there, you might wonder why you should choose us as your travel partner. We're here to share the reasons that make us your trusted gateway to the world's most extraordinary destinations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Tailor-Made Experiences</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                No two travelers are the same. We craft personalized itineraries that match your interests, budget, and travel style - whether it’s a luxury safari, beach escape, city break, or group adventure.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Safety & Reliability First</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                Your safety is our priority. We work only with vetted hotels, transport providers, and guides who meet strict safety and quality standards, so you travel with confidence and peace of mind.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Tag className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Transparent Pricing & Best Value</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                We offer competitive rates and exceptional value, ensuring you get the best experience for your investment.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Dedicated Travel Experts</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                You’re not booking with a system - you’re working with experienced travel professionals who understand destinations firsthand and provide honest, expert advice.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Clock className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">24/7 Support</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                Travel doesn’t follow office hours, and neither do we. Our team is available whenever you need assistance, from planning to your return home.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Plane className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Seamless Planning</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                Flights, transfers, accommodations, activities - we handle every detail so you can focus on enjoying your journey stress-free.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1 lg:col-start-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Star className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-4 font-playfair">Trusted by Travelers</h3>
                            <p className="text-gray-600 leading-relaxed font-light text-sm">
                                Our growing base of repeat clients and referrals speaks for itself. We build long-term relationships, not just bookings.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dual Promotional Sections */}
            <section className="grid grid-cols-1 md:grid-cols-2">
                {/* Let's Chat */}
                <div className="bg-primary py-20 px-8 text-center text-white flex flex-col items-center justify-center">
                    <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Let's Chat</h2>
                    <div className="w-12 h-0.5 bg-white mb-8"></div>
                    <p className="text-lg leading-relaxed max-w-md mx-auto mb-10 font-lato">
                        We have answers to all your questions.<br />
                        Start planning your dream trip by talking to our Destination Specialists
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                        <a href="tel:+256782594008" className="border border-white hover:bg-white hover:text-primary transition-colors py-3 px-8 rounded font-bold tracking-widest text-sm flex-1">
                            CALL NOW
                        </a>
                        <Link to="/contact-us" className="border border-white hover:bg-white hover:text-primary transition-colors py-3 px-8 rounded font-bold tracking-widest text-sm flex-1">
                            START PLANNING
                        </Link>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="bg-charcoal py-20 px-8 text-center text-white flex flex-col items-center justify-center">
                    <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Sign up for our newsletter</h2>
                    <div className="w-12 h-0.5 bg-white mb-8"></div>
                    <p className="text-lg leading-relaxed max-w-md mx-auto mb-10 font-lato">
                        Receive the latest travel inspiration and destination news.
                    </p>
                    <a href="#newsletter" className="border border-white/30 hover:bg-white hover:text-charcoal transition-colors py-3 px-12 rounded font-bold tracking-widest text-sm">
                        SIGNUP
                    </a>
                </div>
            </section>

            {/* Three Steps Section */}
            <ThreeStepsSection />

            {/* 24/7 Customer Support Section */}
            <ContactUsCard hideFeatures={true} />

        </div>
    );
};

export default AboutUsPage;
