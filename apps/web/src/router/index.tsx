import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { routes } from "../config/routes";
import { logEvent } from "../lib/logger";

/**
 * Track screen views when route changes
 */
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const route = routes.find((r) => r.path === location.pathname);
    const screenName = route?.label || location.pathname;

    logEvent("screen_view", {
      screen: screenName,
      path: location.pathname,
    });
  }, [location.pathname]);

  return null;
}

export function Router() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <AppLayout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

