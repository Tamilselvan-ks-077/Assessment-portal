import React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'flex items-center justify-between gap-4 select-none cursor-pointer group py-1.5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col text-sm">
          {label && <span className="font-medium text-slate-800 leading-snug">{label}</span>}
          {description && <span className="text-xs text-slate-500 mt-0.5">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-slate-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
};
