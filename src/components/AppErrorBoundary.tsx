import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Trusted Bums render error", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-6 shadow-sm">
          <p className="font-display text-2xl font-bold">Something went wrong</p>
          <p className="mt-3 text-sm text-muted-foreground">
            The portal hit an unexpected loading error. Refresh the page, or return home and sign in again.
          </p>
          <p className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => window.location.reload()}>Refresh</Button>
            <Button variant="outline" onClick={() => window.location.assign("/")}>
              Return home
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
