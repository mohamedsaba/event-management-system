import React from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8 text-center animate-fade-in-up">
          <AlertOctagon className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.state.error?.message || "An unexpected error occurred in this module."}
          </p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;