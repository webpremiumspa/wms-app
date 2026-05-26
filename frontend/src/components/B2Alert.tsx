import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

type Item = { sku: string | null; name: string; qty: number; thumbnailUrl: string | null };

// Beep simple via Web Audio API. No bundle adicional.
function beep(durationMs = 600) {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close().catch(() => {});
    }, durationMs);
  } catch {
    // ignore (algunos navegadores requieren gesto del usuario)
  }
}

export function B2Alert({ items }: { items: Item[] }) {
  useEffect(() => {
    if (items.length === 0) return;
    beep(700);
    setTimeout(() => beep(700), 850);
    if ('vibrate' in navigator) navigator.vibrate([300, 120, 300, 120, 300]);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-amber-400 p-4 ring-4 ring-amber-500 shadow-lg">
      <div className="flex items-start gap-3">
        <AlertOctagon className="shrink-0 text-amber-900" size={36} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold uppercase text-amber-950">
            ⚠ Bodega 2 pendiente
          </div>
          <div className="text-sm text-amber-900">
            Sacar del cargamento a granel antes de entregar:
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 rounded-lg bg-amber-50 p-2 ring-1 ring-amber-300"
          >
            {it.thumbnailUrl ? (
              <img src={it.thumbnailUrl} alt={it.name} className="h-12 w-12 rounded-md object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-md bg-amber-200" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-amber-950">{it.name}</div>
              <div className="text-xs text-amber-800">{it.sku || '—'}</div>
            </div>
            <div className="text-2xl font-bold text-amber-900">×{it.qty}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
