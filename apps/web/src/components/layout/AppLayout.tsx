import { ReactNode, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { routes } from "../../config/routes";
import {
  InstallPromptBanner,
  SWUpdateToast,
  OfflineIndicator,
  ToastContainer,
} from "../common";
import { useDisplayMode } from "../../hooks/useDisplayMode";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const currentRoute = routes.find((r) => r.path === location.pathname);
  const pageTitle = currentRoute?.label || "FlatFlow";
  const { isMobileShell } = useDisplayMode();

  // Apply mobile-shell class to html element for safe area CSS
  useEffect(() => {
    if (isMobileShell) {
      document.documentElement.classList.add("mobile-shell");
    } else {
      document.documentElement.classList.remove("mobile-shell");
    }
    return () => {
      document.documentElement.classList.remove("mobile-shell");
    };
  }, [isMobileShell]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
      
      {/* Page content */}
      <div className="drawer-content flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <Navbar />
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-base-100 border-b border-base-300 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-base-200">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* PWA Install Prompt Banner */}
      <InstallPromptBanner />

      {/* Service Worker Update Toast */}
      <SWUpdateToast />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

