import { useState, useEffect } from "react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { useIsStandalone } from "../../hooks/useIsStandalone";

export function InstallPromptBanner() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const isStandalone = useIsStandalone();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user previously dismissed (session storage)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("install-prompt-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("install-prompt-dismissed", "true");
  };

  return (
    <div className="fixed bottom-20 md:bottom-24 left-0 right-0 z-50 px-4 pb-safe">
      <div className="max-w-6xl mx-auto">
        <div className="alert alert-info shadow-lg">
          <div className="flex-1">
            <div>
              <h3 className="font-bold">Install FlatFlow?</h3>
              <p className="text-sm">
                Get a better experience by adding this app to your home screen.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleInstall}
            >
              Install now
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleDismiss}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

