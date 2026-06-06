import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import { REMOVE_REASON_LABELS } from '@/lib/labels';

type Props = {
  open: boolean;
  orderNumber: string;
  onClose: () => void;
  onConfirm: (reasonCode: string, reasonText: string) => void;
  isPending?: boolean;
  error?: string | null;
};

// Modal de confirmación con motivo para remover un pedido de una secuencia.
// El pedido pasa a estado 'blocked' — se distingue de los simplemente recibidos.
export function RemoveOrderModal({ open, orderNumber, onClose, onConfirm, isPending, error }: Props) {
  const [reasonCode, setReasonCode] = useState<string>('sin_stock_b1');
  const [reasonText, setReasonText] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-md space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-semibold">Remover pedido #{orderNumber}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-600">
          El pedido pasa a estado <strong>Bloqueado</strong>. Sale de esta secuencia y queda esperando que alguien lo reactive (cuando llegue stock, etc.). Su progreso (picking/packing) se pierde.
        </p>

        <div>
          <div className="text-xs font-medium text-slate-700">Motivo</div>
          <div className="mt-1 space-y-1">
            {Object.entries(REMOVE_REASON_LABELS).map(([code, label]) => (
              <label
                key={code}
                className={clsx(
                  'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm',
                  reasonCode === code ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-slate-50',
                )}
              >
                <input
                  type="radio"
                  name="reason"
                  value={code}
                  checked={reasonCode === code}
                  onChange={() => setReasonCode(code)}
                  className="h-4 w-4 accent-brand-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-700">Detalle opcional</span>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Ej: producto sin stock hasta el miércoles"
            rows={2}
            className="input mt-1 text-sm"
            maxLength={500}
          />
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost border border-slate-300" disabled={isPending}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reasonCode, reasonText)}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Removiendo…' : 'Confirmar remoción'}
          </button>
        </div>
      </div>
    </div>
  );
}
