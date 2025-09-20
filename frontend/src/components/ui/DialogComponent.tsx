import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold">
      {children}
    </h2>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };
