import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center bg-forest px-6 text-center text-ivory" data-testid="error-boundary">
          <p className="eyebrow mb-4">Something went off-trail</p>
          <h2 className="text-3xl">This section could not be displayed.</h2>
          <button type="button" className="btn-gold mt-8" onClick={() => window.location.reload()}>Reload page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
