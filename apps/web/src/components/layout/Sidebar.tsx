import { Link, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="drawer-side">
      <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
      <aside className="w-64 min-h-full bg-base-100 border-r border-base-300">
        <div className="p-4">
          <Link to="/" className="btn btn-ghost normal-case text-xl font-bold mb-4 w-full justify-start">
            <span className="text-2xl mr-2">🏠</span>
            FlatFlow
          </Link>
        </div>
        <ul className="menu p-4 w-full gap-1">
          {routes.map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <li key={route.path}>
                <Link
                  to={route.path}
                  className={`${isActive ? "active bg-primary text-primary-content" : ""} rounded-lg`}
                >
                  <span className="text-xl mr-3">{route.icon}</span>
                  {route.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

