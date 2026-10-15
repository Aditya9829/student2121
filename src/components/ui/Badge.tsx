import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'teal';
}

const colors = {
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

export function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      {children}
    </span>
  );
}
