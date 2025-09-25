import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="text-center py-16">
          <h1 className="text-4xl font-playfair mb-6">Something went wrong.</h1>
          <p className="text-lg mb-8">We're sorry, but an unexpected error occurred. Please try again later.</p>
          <a href="/" className="bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md font-medium transition-colors">
            Back to Home
          </a>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
