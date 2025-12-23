import { Card } from "@flatflow/ui";

interface SkeletonLoaderProps {
  type?: "card" | "list" | "table" | "stats" | "chart";
  count?: number;
}

export function SkeletonLoader({
  type = "card",
  count = 1,
}: SkeletonLoaderProps) {
  if (type === "stats") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="h-4 bg-base-300 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-base-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-base-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-base-300 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i}>
                      <div className="h-4 bg-base-300 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}>
                        <div className="h-4 bg-base-300 rounded w-24 animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (type === "chart") {
    return (
      <Card variant="bordered">
        <div className="card-body">
          <div className="h-6 bg-base-300 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-64 bg-base-300 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  // Default: card
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} variant="bordered">
          <div className="card-body">
            <div className="space-y-3">
              <div className="h-6 bg-base-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-base-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-base-300 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
