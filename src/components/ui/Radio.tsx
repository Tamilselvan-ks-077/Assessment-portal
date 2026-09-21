import React from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, checked, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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
            type="radio"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150',
              'border-slate-300 bg-white group-hover:border-indigo-400 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-1',
              'peer-checked:border-indigo-600'
            )}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-150" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && <span className="font-medium text-slate-800 leading-snug">{label}</span>}
            {description && <span className="text-xs text-slate-500 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
