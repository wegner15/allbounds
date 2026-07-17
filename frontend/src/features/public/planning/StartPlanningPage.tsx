import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeoHead from '../../../components/seo/SeoHead';
import { ArrowLeft } from 'lucide-react';

// Import Wizard Steps
import Step1Region from './components/Step1Region';
import Step2Country from './components/Step2Country';
import Step3Dates from './components/Step3Dates';
import Step4Experience from './components/Step4Experience';
import Step5Accommodation from './components/Step5Accommodation';
import Step6Budget from './components/Step6Budget';
import Step7Companions from './components/Step7Companions';
import Step8Details from './components/Step8Details';
import { apiClient } from '../../../lib/api';

export interface PlanningState {
  regionId: number | 'not-sure' | null;
  countryId: number | 'not-sure' | null;
  dateType: 'idea' | 'exact' | null;
  year: string | null;
  month: string | 'not-sure' | 'any' | null;
  duration: string | null;
  experiences: number[]; // Array of holiday type IDs
  experiencesNotSure: boolean;
  accommodation: number | 'not-sure' | null; // Hotel type ID
  budget: number | 'not-sure' | null;
  currency: string;
  companions: string | null;
  moreInfo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const TOTAL_STEPS = 8;

const StartPlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [state, setState] = useState<PlanningState>({
    regionId: null,
    countryId: null,
    dateType: 'idea',
    year: null,
    month: null,
    duration: null,
    experiences: [],
    experiencesNotSure: false,
    accommodation: null,
    budget: 10000,
    currency: 'USD',
    companions: null,
    moreInfo: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const updateState = (updates: Partial<PlanningState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    // If region is 'not-sure', skip country selection (step 2)
    if (currentStep === 1 && state.regionId === 'not-sure') {
      setCurrentStep(3);
    } else if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    // If we are on step 3 and region was 'not-sure', go back to step 1
    if (currentStep === 3 && state.regionId === 'not-sure') {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1); // Go back to previous page in history
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: `${state.firstName} ${state.lastName}`.trim(),
        email: state.email,
        phone: state.phone || undefined,
        subject: 'New Trip Planning Inquiry',
        message: state.moreInfo || 'A user has completed the Start Planning wizard.',
        source: 'Start Planning Wizard',
        details: {
          regionId: state.regionId,
          countryId: state.countryId,
          dateType: state.dateType,
          year: state.year,
          month: state.month,
          duration: state.duration,
          experiences: state.experiences,
          experiencesNotSure: state.experiencesNotSure,
          accommodation: state.accommodation,
          budget: state.budget,
          currency: state.currency,
          companions: state.companions,
        }
      };

      await apiClient.post('/bookings/inquiries/', payload);
      alert('Thank you! Your inquiry has been submitted. A specialist will be in touch shortly.');
      navigate('/');
    } catch (error) {
      console.error("Failed to submit inquiry", error);
      alert('Sorry, there was an error submitting your inquiry. Please try again later.');
    }
  };

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Region state={state} updateState={updateState} onNext={nextStep} />;
      case 2:
        return <Step2Country state={state} updateState={updateState} onNext={nextStep} />;
      case 3:
        return <Step3Dates state={state} updateState={updateState} onNext={nextStep} />;
      case 4:
        return <Step4Experience state={state} updateState={updateState} onNext={nextStep} />;
      case 5:
        return <Step5Accommodation state={state} updateState={updateState} onNext={nextStep} />;
      case 6:
        return <Step6Budget state={state} updateState={updateState} onNext={nextStep} />;
      case 7:
        return <Step7Companions state={state} updateState={updateState} onNext={nextStep} />;
      case 8:
        return <Step8Details state={state} updateState={updateState} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <SeoHead
        title="Start Planning Your Trip"
        description="Plan your dream trip with AllBound Vacations. Use our interactive wizard to tailor your journey."
        canonicalPath="/start-planning"
        noIndex={true} // Don't index the wizard itself
      />

      {/* Top Banner */}
      <div className="bg-[#EBE9E1] py-4 px-6 flex justify-center items-center border-b border-[#E0DED4]">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center">
          {/* Mock logo for the award - replaced with something simpler for now */}
          <div className="w-16 h-16 rounded-full border border-gray-400 flex items-center justify-center font-bold text-xs text-gray-700 bg-white">
            WORLD'S<br/>BEST
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-playfair text-gray-900">We're one of the World's Best Tour Operators!</h2>
            <p className="text-sm text-gray-600">Voted No.1 in 2024 and No.2 in 2025 by <span className="underline cursor-pointer">Travel+Leisure</span></p>
          </div>
        </div>
      </div>

      {/* Wizard Header / Progress */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8 text-sm">
          <button onClick={prevStep} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="hidden md:flex flex-1 mx-8 relative h-1.5 bg-[#EBE9E1] rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#F3E24A] transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <button className="text-gray-600 hover:text-gray-900 underline transition-colors">
            View selections
          </button>
        </div>

        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Dynamic Step Content */}
        <div className="min-h-[50vh]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default StartPlanningPage;
