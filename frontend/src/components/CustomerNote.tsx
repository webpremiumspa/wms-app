import { StickyNote } from 'lucide-react';

// Banner amarillo claro con la nota del cliente desde WooCommerce.
// No renderiza si la nota está vacía. Pre-line preserva los saltos de línea
// que el cliente haya tipeado en el checkout.
export function CustomerNote({ note }: { note?: string | null }) {
  if (!note || !note.trim()) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
      <StickyNote size={14} className="mt-0.5 shrink-0 text-amber-700" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          Nota del cliente
        </div>
        <div className="whitespace-pre-line text-sm text-amber-900 break-words">{note}</div>
      </div>
    </div>
  );
}
