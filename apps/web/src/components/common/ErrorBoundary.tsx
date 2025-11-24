import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@flatflow/ui";
import { logError } from "../../lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and potentially to error reporting service
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card bg-base-100 shadow-lg max-w-md w-full">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="card-title justify-center text-2xl mb-2">
                Something went wrong
              </h2>
              <p className="text-base-content/60 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="alert alert-error mb-4 text-left">
                  <div>
                    <div className="font-bold">Error Details (Dev Mode)</div>
                    <div className="text-xs mt-2 font-mono break-all">
                      {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs">Stack Trace</summary>
                        <pre className="text-xs mt-2 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
              <div className="card-actions justify-center gap-2">
                <Button variant="primary" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

