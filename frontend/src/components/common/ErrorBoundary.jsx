import { Component } from 'react';

/**
 * ErrorBoundary — catches render errors in child component tree.
 * Prevents blank screen by showing a clean fallback UI.
 * Uses class component (required by React error boundary API).
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div
            className="rounded-xl p-8 max-w-md w-full text-center"
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Something went wrong
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-surface)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
