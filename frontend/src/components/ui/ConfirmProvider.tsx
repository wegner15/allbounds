import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Drop-in replacement for `window.confirm` that renders the app's own
 * ConfirmationModal. Usage:
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: 'Delete invoice', message: '...' }))) return;
 */
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback<ConfirmFn>((opts) => {
    // Resolve any dialog that is still pending as "cancelled"
    resolverRef.current?.(false);
    setOptions(typeof opts === 'string' ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmationModal
        isOpen={options !== null}
        onClose={() => settle(false)}
        onConfirm={() => settle(true)}
        title={options?.title ?? 'Please confirm'}
        message={options?.message ?? ''}
        confirmText={options?.confirmText ?? 'Confirm'}
        cancelText={options?.cancelText ?? 'Cancel'}
        variant={options?.variant ?? 'danger'}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a <ConfirmProvider>');
  }
  return ctx;
};
