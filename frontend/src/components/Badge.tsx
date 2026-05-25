import clsx from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'gray' | 'blue' | 'amber' | 'green' | 'red';

const styles: Record<Variant, string> = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-700',
};

export function Badge({ variant = 'gray', children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', styles[variant])}>
      {children}
    </span>
  );
}
