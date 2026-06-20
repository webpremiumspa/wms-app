import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function OrderSearchBox({ value, onChange, placeholder = 'Buscar por ID de pedido…' }: Props) {
  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-8 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Limpiar"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Resalta el substring `match` dentro de `text` envolviendo la coincidencia
// en un <mark>. Si no hay match o match está vacío, devuelve el texto plano.
export function HighlightedNumber({ text, match }: { text: string; match: string }) {
  if (!match) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(match.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-200 px-0.5 text-slate-900">{text.slice(idx, idx + match.length)}</mark>
      {text.slice(idx + match.length)}
    </>
  );
}

// Filtro client-side por número de pedido. Sin trim para que el usuario pueda
// buscar prefijos parciales con espacios.
export function matchesOrderId(orderNumber: string, query: string): boolean {
  if (!query) return true;
  return orderNumber.toLowerCase().includes(query.toLowerCase().trim());
}
