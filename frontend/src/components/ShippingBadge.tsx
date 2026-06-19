import { Truck } from 'lucide-react';
import clsx from 'clsx';

const PALETTE = [
  'bg-blue-50 text-blue-800 ring-blue-200',
  'bg-purple-50 text-purple-800 ring-purple-200',
  'bg-pink-50 text-pink-800 ring-pink-200',
  'bg-teal-50 text-teal-800 ring-teal-200',
  'bg-orange-50 text-orange-800 ring-orange-200',
  'bg-rose-50 text-rose-800 ring-rose-200',
  'bg-cyan-50 text-cyan-800 ring-cyan-200',
  'bg-indigo-50 text-indigo-800 ring-indigo-200',
];

// Hash djb2 estable: misma cadena → mismo color siempre.
function colorFor(method: string): string {
  let h = 5381;
  for (let i = 0; i < method.length; i++) {
    h = ((h << 5) + h + method.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const MAX_LEN = 40;

export function ShippingBadge({ method }: { method: string | null | undefined }) {
  if (!method) return null;
  const display = method.length > MAX_LEN ? method.slice(0, MAX_LEN - 1) + '…' : method;
  return (
    <span
      title={method}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        colorFor(method),
      )}
    >
      <Truck size={12} />
      {display}
    </span>
  );
}
