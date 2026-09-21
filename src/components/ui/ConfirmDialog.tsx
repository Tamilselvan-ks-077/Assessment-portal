import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      bg: 'bg-rose-100 text-rose-600',
      icon: <AlertTriangle className="w-6 h-6" />,
      btnVariant: 'danger' as const,
    },
    warning: {
      bg: 'bg-amber-100 text-amber-600',
      icon: <AlertTriangle className="w-6 h-6" />,
      btnVariant: 'primary' as const,
    },
    primary: {
      bg: 'bg-indigo-100 text-indigo-600',
      icon: <Info className="w-6 h-6" />,
      btnVariant: 'primary' as const,
    },
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={false}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${iconConfig.bg}`}>{iconConfig.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">{title}</h3>
          <div className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={iconConfig.btnVariant}
          size="sm"
          onClick={() => {
            onConfirm();
          }}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
