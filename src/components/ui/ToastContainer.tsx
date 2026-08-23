import React, { useEffect } from 'react';
import { useToastStore, type ToastItem } from '../../stores/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
  error: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
  info: 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100',
  warning: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
};

const iconStyles = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  info: 'text-indigo-600 dark:text-indigo-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

const SingleToast: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto max-w-md w-full',
        toastStyles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[toast.type])} />

      <div className="flex-1 text-xs">
        <h4 className="font-semibold tracking-tight leading-snug">{toast.title}</h4>
        {toast.message && <p className="mt-0.5 opacity-90">{toast.message}</p>}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none max-w-full px-4"
    >
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} />
      ))}
    </div>
  );
};
