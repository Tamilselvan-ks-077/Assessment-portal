import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[] | readonly string[] | string[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, hint, id, disabled, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const formattedOptions: SelectOption[] = options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-white border rounded-xl text-sm text-slate-800 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed shadow-subtle min-h-[42px] px-3.5 pr-10 py-2.5',
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          >
            {formattedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
