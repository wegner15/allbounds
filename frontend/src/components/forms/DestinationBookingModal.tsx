import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import DestinationBookingForm from './DestinationBookingForm';

interface DestinationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: string;
  countryId?: number;
}

export const DestinationBookingModal: React.FC<DestinationBookingModalProps> = ({
  isOpen,
  onClose,
  defaultDestination,
  countryId
}) => {
  // Disable background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gray-50/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 font-sans">
              Destination Inquiry & Booking
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto p-2 sm:p-6 flex-1">
          <DestinationBookingForm
            defaultDestination={defaultDestination}
            countryId={countryId}
            onSuccess={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DestinationBookingModal;
