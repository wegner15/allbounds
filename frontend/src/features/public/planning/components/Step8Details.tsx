import React from 'react';
import type { PlanningState } from '../StartPlanningPage';
import { Star } from 'lucide-react';

interface Step8Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onSubmit: () => void;
}

const Step8Details: React.FC<Step8Props> = ({ state, updateState, onSubmit }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.firstName || !state.lastName || !state.email) {
      alert("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }
    onSubmit();
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-12">
        Ok great, we're almost there!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column - Value Prop */}
        <div>
          <div className="bg-[#EBF3F8] p-6 md:p-8 rounded-xl h-full">
            <h3 className="font-bold text-gray-900 mb-2">Let's help you plan</h3>
            <p className="text-sm text-gray-700 mb-6">We're here to help you every step of the way:</p>
            
            <ul className="space-y-4 mb-8 text-sm text-gray-800">
              <li className="flex items-start">
                <span className="mr-3 text-gray-500">•</span>
                <span>Expert advice tailored to your style</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-gray-500">•</span>
                <span>Handcrafted experiences you won't find anywhere else</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-gray-500">•</span>
                <span>Seamless planning, bookings & concierge support</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-gray-500">•</span>
                <span>24/7 assistance wherever you are in the world</span>
              </li>
            </ul>

            <div className="border-t border-blue-200 pt-6">
              <div className="flex -space-x-2 mb-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Reviewer" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Reviewer" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Reviewer" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Our guests rate us excellent</p>
              <div className="flex items-center text-sm">
                <div className="flex text-black mr-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold mr-1">4.9/5</span>
                <span className="text-gray-500">(1127 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Please tell us more so we can tailor your trip for you
              </label>
              <textarea
                value={state.moreInfo}
                onChange={(e) => updateState({ moreInfo: e.target.value })}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none text-sm resize-none"
                placeholder="For example: It's our 20th anniversary · My daughter is obsessed with elephants · We've done Kenya before and want something different"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">First name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={state.firstName}
                  onChange={(e) => updateState({ firstName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Last name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={state.lastName}
                  onChange={(e) => updateState({ lastName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                value={state.phone}
                onChange={(e) => updateState({ phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:outline-none"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-4 bg-primary text-white font-bold tracking-widest uppercase rounded hover:bg-primary-dark transition-colors shadow-sm"
              >
                Submit Request
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting this form, you agree to our Terms and Conditions and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Step8Details;
