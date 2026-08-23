import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  avatar?: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  options: CustomSelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
  buttonClassName,
  disabled = false,
  required = false,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const labelId = `${generatedId}-label`;

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
          const opt = options[focusedIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
          }
        } else {
          setIsOpen((prev) => !prev);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('w-full space-y-1.5 relative', className)}>
      {label && (
        <label
          id={labelId}
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Custom Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
        aria-label={ariaLabel || label || 'Select option'}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all text-left select-none',
          'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-950',
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600',
          disabled && 'opacity-60 bg-neutral-50 dark:bg-neutral-800/50 cursor-not-allowed',
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.avatar && (
            <img
              src={selectedOption.avatar}
              alt={selectedOption.label}
              className="h-5 w-5 rounded-full object-cover shrink-0"
            />
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200',
            isOpen && 'transform rotate-180 text-indigo-500'
          )}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xl py-1 text-sm animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {options.map((opt, index) => {
            const isSelected = String(opt.value) === String(value);
            const isFocused = index === focusedIndex;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setIsOpen(false);
                  }
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2 cursor-pointer transition-colors select-none',
                  opt.disabled && 'opacity-50 cursor-not-allowed',
                  isFocused
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300',
                  isSelected && 'font-semibold text-indigo-600 dark:text-indigo-400'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.avatar && (
                    <img
                      src={opt.avatar}
                      alt={opt.label}
                      className="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                  )}
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <span>{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[11px] text-neutral-400 font-normal truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
