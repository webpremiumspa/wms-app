import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import { REMOVE_REASON_LABELS } from '@/lib/labels';

type Props = {
  open: boolean;
  orderNumber: string;
  // Estado actual del pedido. Usado para mostrar aviso reforzado cuando
  // el pedido ya está empacado, clasificado o cargado: la bolsa volverá
  // físicamente a la bodega.
  currentStatus?: string;
  onClose: () => void;
  onConfirm: (reasonCode: string, reasonText: string) => void;
  isPending?: boolean;
  error?: string | null;
};

// Modal de confirmación para sacar un pedido de su secuencia.
// El pedido vuelve a la pila de pendientes (status='received') con un
// evento de auditoría. La lista de pendientes muestra el motivo como
// badge contextual para que el supervisor decida si lo incluye o no en
// la próxima secuencia.
export function RemoveOrderModal({
  open,
  orderNumber,
  currentStatus,
  onClose,
  onConfirm,
  isPending,
  error,
}: Props) {
  const [reasonCode, setReasonCode] = useState<string>('cliente_no_recibe');
  const [reasonText, setReasonText] = useState('');

  // Resetea el formulario cada vez que se abre. Evita mostrar el motivo
  // del pedido anterior si el supervisor abre el modal en sucesión.
  useEffect(() => {
    if (open) {
      setReasonCode('cliente_no_recibe');
      setReasonText('');
    }
  }, [open]);

  if (!open) return null;

  // Si el pedido ya está empacado o más allá, el bag físico tiene que
  // volver a bodega. Lo señalamos fuerte para que el operador no haga clic
  // sin pensar.
  const isBagDeployed = ['packed', 'classified', 'loaded'].includes(currentStatus || '');
  const statusLabel = currentStatus === 'packed'
    ? 'empacado'
    : currentStatus === 'classified'
      ? 'clasificado'
      : currentStatus === 'loaded'
        ? 'cargado al vehículo'
        : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-md space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-semibold">Sacar pedido #{orderNumber} de la secuencia</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600">
          El pedido vuelve a la pila de <strong>pendientes</strong> y queda disponible para entrar a una próxima secuencia. Se pierde su progreso actual (picking/packing/clasificación/carga) y el motivo queda registrado en el log.
        </p>

        {isBagDeployed && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-300">
            <div className="flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <strong>Pedido ya {statusLabel}.</strong> Verifica que la bolsa volverá físicamente a la bodega antes de confirmar — si la dejas afuera se pierde sin reflejo en el sistema.
              </div>
            </div>
          </div>
        )}

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
            placeholder="Ej: cliente confirmó por WhatsApp que reagenda para mañana"
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
            {isPending ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
