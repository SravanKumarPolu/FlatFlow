import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // in milliseconds, default 3000
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const generateId = () => `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = "info", duration = 3000) => {
    const id = generateId();
    const toast: Toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, duration) => {
    useToastStore.getState().addToast(message, "success", duration);
  },

  error: (message, duration) => {
    useToastStore.getState().addToast(message, "error", duration);
  },

  info: (message, duration) => {
    useToastStore.getState().addToast(message, "info", duration);
  },

  warning: (message, duration) => {
    useToastStore.getState().addToast(message, "warning", duration);
  },
}));

