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
const LOCAL_STORAGE_KEY = 'allbounds_planning_state';
const LOCAL_STORAGE_STEP_KEY = 'allbounds_planning_step';

const getInitialState = (): PlanningState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse planning state from local storage', e);
  }
  return {
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
  };
};

const getInitialStep = (): number => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_STEP_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_STEPS) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse planning step from local storage', e);
  }
  return 1;
};

const StartPlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(getInitialStep);
  const [state, setState] = useState<PlanningState>(getInitialState);

  // Save to local storage whenever state or step changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STEP_KEY, currentStep.toString());
  }, [currentStep]);

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
      // Clear storage on success
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_STEP_KEY);
      
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
          {/* Logo icon */}
          <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-white overflow-hidden shadow-sm">
            <img src="/logo/android-chrome-192x192.png" alt="Allbound Vacations" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-playfair text-gray-900">Your Journey Begins Here</h2>
            <p className="text-sm text-gray-600">Let our destination specialists craft the perfect itinerary just for you.</p>
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
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
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
