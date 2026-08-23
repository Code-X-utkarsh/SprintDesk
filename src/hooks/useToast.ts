import { useToastStore, type ToastType } from '../stores/useToastStore';

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = {
    success: (title: string, message?: string, duration = 4000) =>
      addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration = 5000) =>
      addToast({ type: 'error', title, message, duration }),
    info: (title: string, message?: string, duration = 4000) =>
      addToast({ type: 'info', title, message, duration }),
    warning: (title: string, message?: string, duration = 4000) =>
      addToast({ type: 'warning', title, message, duration }),
    custom: (type: ToastType, title: string, message?: string, duration = 4000) =>
      addToast({ type, title, message, duration }),
    dismiss: (id: string) => removeToast(id),
    clear: () => clearToasts(),
  };

  return { toast };
}
