import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'flex items-start gap-3 select-none cursor-pointer group py-1',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150',
              'border-slate-300 bg-white group-hover:border-indigo-400 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-1',
              'peer-checked:bg-indigo-600 peer-checked:border-indigo-600',
              error && 'border-rose-400'
            )}
          >
            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && <span className="font-medium text-slate-800 leading-snug">{label}</span>}
            {description && <span className="text-xs text-slate-500 mt-0.5">{description}</span>}
            {error && <span className="text-xs text-rose-600 mt-0.5">{error}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
