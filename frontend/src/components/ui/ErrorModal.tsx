import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './DialogComponent';
import Button from './Button';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = 'Error',
  message,
  details,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">{message}</p>
          {details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show technical details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto max-h-32">
                {details}
              </pre>
            </details>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorModal;