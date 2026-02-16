import React from 'react';
import { Compass, CreditCard, Calendar } from 'lucide-react';

const PaymentPlansPage: React.FC = () => {
    return (
        <div className="bg-white min-h-screen font-lato">
            {/* Hero Section */}
            <div className="relative h-[400px] flex items-center justify-center text-center text-white">
                <div className="absolute inset-0 bg-blue-600 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
                        alt="Tropical Beach"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-transparent"></div>
                </div>
                <div className="relative container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-playfair tracking-tight">
                        Pay for your bucket list<br className="hidden md:block" /> trip in instalments
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        If you're managing your budget, or after a bit of flexibility, paying for your custom holiday in instalments can take the stress out of booking.
                    </p>
                </div>
            </div>

            {/* Overview Section */}
            <div className="container mx-auto px-4 py-20 text-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block">OVERVIEW</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-playfair">Book today, pay in instalments</h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    Pay in instalments is available on eligible Tours, Cruises and Exclusive Hotel Packages. Look for the pay in instalments icon on eligible deals in the deal cart, and lock in your spot with a deposit and a one-off service fee. Then, enjoy peace of mind as you pay the balance in instalments prior to departure.
                </p>
            </div>

            {/* Feature Cards Section */}
            <div className="container mx-auto px-4 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-10 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-start h-full transition-transform hover:translate-y-[-4px] duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                            <Compass className="w-7 h-7 text-gray-800" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">Find a Tour, Cruise or Exclusive Hotel Package</h3>
                        <p className="text-gray-600 leading-relaxed font-light">Choose from an extensive range of deals and dates.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-10 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-start h-full transition-transform hover:translate-y-[-4px] duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                            <CreditCard className="w-7 h-7 text-gray-800" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">Book with a deposit</h3>
                        <p className="text-gray-600 leading-relaxed font-light">Save your spot on tour with a deposit and finalise payment in instalments before you go.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-10 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-start h-full transition-transform hover:translate-y-[-4px] duration-300">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                            <Calendar className="w-7 h-7 text-gray-800" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">Convenient payment schedule</h3>
                        <p className="text-gray-600 leading-relaxed font-light">View your payment schedule at any time through your secure account.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPlansPage;
