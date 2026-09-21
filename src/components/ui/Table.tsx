import React from 'react';
import { cn } from '../../utils/cn';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
    <table className={cn('w-full text-left text-sm text-slate-700', className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200', className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('hover:bg-slate-50/80 transition-colors', className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-4 py-3.5 font-semibold text-slate-600 tracking-wide', className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3.5 align-middle', className)} {...props} />
);
