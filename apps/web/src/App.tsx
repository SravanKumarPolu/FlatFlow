import { useEffect } from "react";
import { Router } from "./router";
import { logEvent } from "./lib/logger";
import { ErrorBoundary } from "./components/common";

const App: React.FC = () => {
  useEffect(() => {
    // Log app start event
    logEvent("app_start", {
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <ErrorBoundary>
      <div data-theme="flatflow" className="min-h-screen bg-base-200">
        <Router />
      </div>
    </ErrorBoundary>
  );
};

export default App;

