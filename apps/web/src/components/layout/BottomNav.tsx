import { Link, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";

export function BottomNav() {
  const location = useLocation();

  // Filter routes that should appear in bottom nav
  const bottomNavRoutes = routes.filter((route) =>
    ["/", "/members", "/bills", "/expenses", "/settings"].includes(route.path)
  );

  return (
    <div className="btm-nav btm-nav-lg bg-base-100 border-t border-base-300 md:hidden">
      {bottomNavRoutes.map((route) => {
        const isActive = location.pathname === route.path;
        return (
          <Link
            key={route.path}
            to={route.path}
            className={`${isActive ? "active text-primary" : "text-base-content/60"}`}
          >
            <span className="text-2xl mb-1">{route.icon}</span>
            <span className="btm-nav-label text-xs">{route.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

