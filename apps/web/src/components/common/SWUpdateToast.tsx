import { useSWUpdate } from "../../hooks/useSWUpdate";

export function SWUpdateToast() {
  const { needRefresh, offlineReady, updateSW } = useSWUpdate();

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="toast toast-top toast-center z-50">
      {offlineReady && (
        <div className="alert alert-success">
          <span className="text-sm">App ready to work offline</span>
        </div>
      )}
      {needRefresh && (
        <div className="alert alert-info">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              A new version is available.
            </span>
            <button
              className="btn btn-sm btn-primary"
              onClick={updateSW}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
