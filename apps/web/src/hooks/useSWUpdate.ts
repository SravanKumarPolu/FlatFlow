import { useRegisterSW } from "virtual:pwa-register/react";

export function useSWUpdate() {
  const {
    offlineReady: [offlineReady, _setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log("SW Registered: ", r);
    },
    onRegisterError(error: Error) {
      console.log("SW registration error", error);
    },
  });

  const updateSW = async () => {
    await updateServiceWorker(true);
    setNeedRefresh(false);
    // Reload the page after update
    window.location.reload();
  };

  return {
    needRefresh,
    offlineReady,
    updateSW,
  };
}

