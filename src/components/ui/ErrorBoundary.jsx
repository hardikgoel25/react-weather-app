import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('Unhandled render error', error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
    return (
      <div className="flex min-h-dvh items-center justify-center p-6" role="alert">
        <div className="glass-strong max-w-md p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-fg-muted">
            The app hit an unexpected error. Reloading usually fixes it; your saved locations and settings are kept.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="focus-ring rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium hover:bg-card-strong"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-[var(--bg-base)]"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
