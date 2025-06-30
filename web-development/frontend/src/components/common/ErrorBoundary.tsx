import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error reporting service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (
        resetKeys?.some(
          (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey,
        )
      ) {
        this.resetErrorBoundary();
      }
    }

    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo): void => {
    // In a real application, you would send this to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    };

    // Example: Send to error reporting service
    // errorReportingService.captureException(errorReport);

    // For now, just log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Report");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Full Report:", errorReport);
      console.groupEnd();
    }
  };

  private resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = (): void => {
    this.resetErrorBoundary();
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private copyErrorToClipboard = async (): Promise<void> => {
    const { error, errorInfo, eventId } = this.state;
    const errorText = `
Error ID: ${eventId}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      alert("Error details copied to clipboard");
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, eventId } = this.state;

      return (
        <div className="error-container">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>
              We apologize for the inconvenience. An unexpected error occurred
              while loading this component.
            </p>

            <div className="error-actions">
              <button
                className="error-button primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button
                className="error-button secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-info">
                  <p>
                    <strong>Error ID:</strong> {eventId}
                  </p>
                  <p>
                    <strong>Error:</strong> {error?.message}
                  </p>
                  <pre className="error-stack">{error?.stack}</pre>
                  {errorInfo && (
                    <pre className="error-component-stack">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                  <button
                    className="error-button copy"
                    onClick={this.copyErrorToClipboard}
                  >
                    Copy Error Details
                  </button>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error boundary integration
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    // This can be used to manually trigger error boundary
    throw error;
  }, []);
};

export default ErrorBoundary;
