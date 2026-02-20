import React, { useState } from 'react';
import VisaForm from './components/VisaForm';
import { Helmet } from 'react-helmet-async';

const VisaApplicationPage: React.FC = () => {
    const [isSuccess, setIsSuccess] = useState(false);

    return (
        <>
            <Helmet>
                <title>Apply for a Visa | Allbound Vacations</title>
                <meta name="description" content="Get expert assistance with your visa application. We offer a 97% approval rate for tourist, business, student, and work visas." />
            </Helmet>

            <div className="min-h-screen bg-gray-50 pb-16">
                {/* Hero Section */}
                <div className="relative h-[400px] md:h-[500px] bg-charcoal overflow-hidden flex items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Passport and Visa"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl mt-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-sm font-medium tracking-wide uppercase">Fast & Reliable Service</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-playfair font-bold mb-6 text-white drop-shadow-lg">
                            Expert Visa Assistance
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-200 font-lato max-w-3xl mx-auto drop-shadow-md">
                            Simplify your travel preparations. Our dedicated experts guide you through the process, ensuring a flawless application.
                        </p>
                    </div>
                </div>

                {/* Stats Ribbon */}
                <div className="bg-primary text-white py-8 border-y border-primary-light/30">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
                            <div>
                                <div className="text-4xl font-bold font-playfair mb-2">97%</div>
                                <div className="text-sm uppercase tracking-wider font-semibold opacity-90">Visa Approval Rate</div>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold font-playfair mb-2">1000+</div>
                                <div className="text-sm uppercase tracking-wider font-semibold opacity-90">Successful Applications</div>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold font-playfair mb-2 mt-2 md:mt-0">
                                    <svg className="w-10 h-10 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                </div>
                                <div className="text-sm uppercase tracking-wider font-semibold opacity-90 mt-2">Trusted by Repeat Clients</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Main Form Section */}
                        <div className="w-full lg:w-2/3">
                            {isSuccess ? (
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h2 className="text-3xl font-playfair font-bold text-charcoal mb-4">Application Received!</h2>
                                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                        Thank you for submitting your visa application. Our experts are already reviewing your details.
                                        We have sent a confirmation email to the address you provided. We will be in touch shortly to advise on the next steps.
                                    </p>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors duration-300"
                                    >
                                        Submit Another Application
                                    </button>
                                </div>
                            ) : (
                                <VisaForm onSuccess={() => setIsSuccess(true)} />
                            )}
                        </div>

                        {/* Sidebar high-conversion widgets */}
                        <div className="w-full lg:w-1/3 space-y-8">

                            {/* Need Help Widget */}
                            <div className="bg-charcoal text-white rounded-2xl shadow-xl p-8 relative overflow-hidden border-t-4 border-primary">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-xl"></div>
                                <h3 className="text-2xl font-playfair font-bold mb-4 relative z-10">Need Help?</h3>
                                <p className="text-gray-300 mb-6 relative z-10">
                                    Not sure which visa type you need, or have questions about the required documents? Our experts are online.
                                </p>
                                <a
                                    href="#"
                                    className="w-full relative z-10 bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-primary-dark hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    Chat With a Visa Expert Now
                                </a>
                            </div>

                            {/* Checklist Widget */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h3 className="text-2xl font-playfair font-bold text-charcoal mb-4">Not ready yet?</h3>
                                <p className="text-gray-600 mb-6 font-semibold">
                                    Get a <span className="text-primary italic">Free</span> Visa Checklist emailed directly to you so you can prepare your documents in advance.
                                </p>
                                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks! Your checklist is on its way."); }}>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-white text-charcoal border-2 border-charcoal font-bold py-3 px-6 rounded-xl hover:bg-charcoal hover:text-white transition-colors duration-300"
                                    >
                                        Email Me The Checklist
                                    </button>
                                </form>
                            </div>

                            {/* Testimonial Widget */}
                            <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
                                <div className="text-primary mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                </div>
                                <p className="italic text-gray-700 font-medium mb-6">"Allbound Vacations made my UK visa application completely stress-free. Their guide helped me organize everything in days, and my visa was approved on the first try!"</p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mr-3 text-lg">
                                        S
                                    </div>
                                    <div>
                                        <div className="font-bold text-charcoal text-sm">Sarah M.</div>
                                        <div className="text-xs text-gray-500">Tourist Visa</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VisaApplicationPage;
