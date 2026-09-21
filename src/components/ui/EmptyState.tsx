import React from 'react';
import { cn } from '../../utils/cn';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50',
        className
      )}
    >
      <div className="p-3.5 bg-white rounded-2xl shadow-sm text-slate-400 mb-3 border border-slate-100">
        {icon || <FolderOpen className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 leading-snug">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
