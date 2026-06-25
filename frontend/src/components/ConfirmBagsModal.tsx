import { AlertOctagon, Package } from 'lucide-react';

type Props = {
  open: boolean;
  bagsCount: number;
  // 'pack'   = al cerrar el pedido la primera vez (declarando los bultos).
  // 'update' = post-empaque, cambiando una cuenta ya guardada.
  mode: 'pack' | 'update';
  fromCount?: number; // solo para mode='update'
  orderNumber?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Modal bloqueante que confirma la cantidad de bultos. Evita que un tap
// accidental al stepper imprima 5 albaranes y deje al cargador confundido.
// Solo se debería mostrar cuando hay riesgo real: bagsCount>1 al cerrar, o
// cambio de cuenta al actualizar.
export function ConfirmBagsModal({
  open,
  bagsCount,
  mode,
  fromCount,
  orderNumber,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  const isMulti = bagsCount > 1;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-md space-y-3 p-4">
        <div className="flex items-start gap-2">
          {isMulti ? (
            <Package className="text-blue-600" size={22} />
          ) : (
            <AlertOctagon className="text-amber-600" size={22} />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">
              {mode === 'pack' ? 'Confirmar bultos' : 'Cambiar cantidad de bultos'}
            </h3>
            {mode === 'pack' ? (
              <p className="mt-1 text-sm text-slate-700">
                Vas a declarar <strong>{bagsCount} bulto{bagsCount === 1 ? '' : 's'}</strong>
                {orderNumber && <> para el pedido <strong>#{orderNumber}</strong></>}.
                {isMulti && (
                  <>
                    {' '}Se imprimirán <strong>{bagsCount} albaranes</strong> numerados
                    "BULTO 1 DE {bagsCount}" … "BULTO {bagsCount} DE {bagsCount}".
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-700">
                {orderNumber && <>Pedido <strong>#{orderNumber}</strong>: </>}
                vas a cambiar la cantidad de bultos de{' '}
                <strong>{fromCount ?? 1}</strong> a <strong>{bagsCount}</strong>.{' '}
                Los albaranes se reimprimirán con la nueva numeración.
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {isMulti
                ? 'Verifica que efectivamente armaste esa cantidad de bolsas antes de continuar.'
                : 'Si solo armaste 1 bolsa puedes seguir; si son más, ajusta antes de confirmar.'}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="btn-ghost border border-slate-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {isPending ? 'Procesando…' : `Sí, ${bagsCount} bulto${bagsCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
