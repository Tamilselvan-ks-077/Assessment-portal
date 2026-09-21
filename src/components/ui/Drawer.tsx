import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: position === 'bottom' ? 'max-h-[40vh]' : 'max-w-sm',
    md: position === 'bottom' ? 'max-h-[60vh]' : 'max-w-md',
    lg: position === 'bottom' ? 'max-h-[80vh]' : 'max-w-lg',
    full: position === 'bottom' ? 'max-h-[95vh]' : 'max-w-full',
  }[size];

  const positionClasses = {
    right: 'inset-y-0 right-0 w-full animate-slide-left',
    left: 'inset-y-0 left-0 w-full animate-slide-right',
    bottom: 'inset-x-0 bottom-0 w-full rounded-t-3xl animate-slide-up',
  }[position];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed bg-white shadow-2xl border-slate-200 flex flex-col z-10',
          positionClasses,
          sizeClasses
        )}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="font-semibold text-slate-900 text-base">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
