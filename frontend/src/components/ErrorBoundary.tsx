import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 p-4 rounded-full border border-red-100">
                <ServerCrash className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-playfair text-gray-900 mb-3">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              We encountered an unexpected error while loading this page. Our team is aware and working on it.
            </p>

            {(import.meta.env?.DEV || process.env.NODE_ENV === 'development') && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left text-xs font-mono text-red-800 overflow-x-auto max-h-48">
                <p className="font-bold mb-1">{this.state.error.name}: {this.state.error.message}</p>
                <pre className="whitespace-pre-wrap text-[11px] text-red-700">{this.state.error.stack}</pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// React Router v6 errorElement fallback component
export const RouteErrorFallback: React.FC = () => {
  const error = useRouteError();
  console.error("Route error boundary caught error:", error);

  let errorMessage = "An unexpected error occurred while loading this page.";
  let errorTitle = "Page Error";

  if (isRouteErrorResponse(error)) {
    errorTitle = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || "The requested page encountered a routing error.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-50 p-4 rounded-full border border-amber-100">
            <AlertTriangle className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-playfair text-gray-900 mb-3">
          {errorTitle}
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

