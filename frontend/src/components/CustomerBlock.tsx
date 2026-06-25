import { Phone, Home, MapPin } from 'lucide-react';

type Props = {
  name?: string | null;
  address?: string | null;
  address2?: string | null;
  city?: string | null;
  phone?: string | null;
  // Si solo tenemos customerAddress (pedido viejo no re-sincronizado),
  // mostramos esa línea sin labels para no inventar campos vacíos.
  legacyMode?: boolean;
};

// Bloque de datos del cliente con labels (Dirección, Comuna, Teléfono)
// para que el repartidor los identifique a un golpe de vista.
// Si el pedido es viejo (sin nuevos campos), cae a la dirección concatenada.
export function CustomerBlock({ name, address, address2, city, phone, legacyMode }: Props) {
  const fullAddress = [address, address2].filter((s) => s && String(s).trim()).join(' · ');
  const hasNewFields = Boolean(address2 || city || phone);
  const showLegacyOnly = !hasNewFields && address && !legacyMode;

  return (
    <div className="space-y-0.5 text-sm">
      <div className="font-semibold text-slate-900">{name || '—'}</div>
      {hasNewFields ? (
        <>
          {fullAddress && (
            <Line icon={<Home size={12} />} label="Dirección" value={fullAddress} />
          )}
          {city && <Line icon={<MapPin size={12} />} label="Comuna" value={city} />}
          {phone && (
            <Line
              icon={<Phone size={12} />}
              label="Teléfono"
              value={<a href={`tel:${phone}`} className="text-brand-700 underline">{phone}</a>}
            />
          )}
        </>
      ) : showLegacyOnly ? (
        <div className="text-xs text-slate-500">{address}</div>
      ) : null}
    </div>
  );
}

function Line({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-xs">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="text-slate-800 break-words">{value}</span>
    </div>
  );
}
