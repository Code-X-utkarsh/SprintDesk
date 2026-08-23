import React, { useEffect, useId } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Reusable Accessible Modal / Dialog Component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descId = `${generatedId}-desc`;

  // Escape key listener & body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Dialog Container */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-left overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 z-10',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
