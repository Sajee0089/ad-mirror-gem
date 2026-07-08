import { Component, ErrorInfo, ReactNode } from "react";
import { clearAllBrowserState } from "@/lib/sessionManager";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

class AuthErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[AuthErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-4 border border-border rounded-lg p-6 bg-card">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            {this.state.message || "The app hit an unexpected error."}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
            >
              Please refresh page
            </button>
            <button
              type="button"
              onClick={() => clearAllBrowserState({ reload: true })}
              className="px-4 py-2 rounded border border-border text-sm"
            >
              Clear cache & restart
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default AuthErrorBoundary;
