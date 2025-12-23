import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}: StatCardProps) {
  const variantClasses = {
    default: "bg-base-100",
    primary: "bg-primary/10 border-primary/20",
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
    error: "bg-error/10 border-error/20",
  };

  return (
    <div
      className={`card border ${variantClasses[variant]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-base-content/60 mb-1">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-base-content/40 ml-4">{icon}</div>
          )}
        </div>
      </div>
    </div>
  );
}









