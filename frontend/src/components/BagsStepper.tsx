import { Minus, Package, Plus } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
};

// Stepper compacto con icono de paquete. Usado al cerrar B1 y al reimprimir
// albaranes pre-numerados. Mantiene el valor dentro de [min, max].
export function BagsStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  disabled,
  className,
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className={clsx('inline-flex items-center gap-2', className)}>
      <Package size={16} className="text-slate-500" />
      <span className="text-sm font-medium text-slate-700">Bultos</span>
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white">
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          className="px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          aria-label="Disminuir bultos"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[2ch] border-x border-slate-200 px-3 py-1 text-center text-base font-bold tabular-nums text-slate-800">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          aria-label="Aumentar bultos"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
