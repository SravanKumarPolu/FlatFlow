/// <reference types="vite/client" />

declare module "virtual:pwa-register/react" {
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export interface UseRegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function useRegisterSW(
    options?: UseRegisterSWOptions
  ): {
    needRefresh: [boolean, (needRefresh: boolean) => void];
    offlineReady: [boolean, (offlineReady: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

