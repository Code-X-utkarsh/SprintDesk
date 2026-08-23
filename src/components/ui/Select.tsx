import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable Accessible Select / Dropdown Component
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      error,
      helperText,
      id: customId,
      className,
      disabled,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'block w-full rounded-md border text-sm transition-colors appearance-none pr-8 pl-3 py-2',
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-950',
              error
                ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500',
              disabled && 'opacity-60 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom Chevron Indicator */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
