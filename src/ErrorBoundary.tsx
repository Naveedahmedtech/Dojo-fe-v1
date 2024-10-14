import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode; 
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  componentDidCatch(error: Error) {
    this.setState({ hasError: true, errorMessage: error.message });
  }

  render() {
    const { hasError} = this.state;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold text-customColor dark:text-red-500 mb-4">Oops! Something went wrong...</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We're sorry, but there was an unexpected error.</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We'll work to fix it as soon as possible.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;