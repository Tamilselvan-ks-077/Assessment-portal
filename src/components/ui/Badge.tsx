import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-300',
  };

  const dotColors = {
    primary: 'bg-indigo-500',
    secondary: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs font-medium px-2.5 py-1 rounded-lg gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border select-none tracking-tight leading-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
