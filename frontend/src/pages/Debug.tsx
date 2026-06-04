import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { debugApi, type DebugOrderResponse } from '@/lib/debug';
import { Spinner } from '@/components/Spinner';
import { Badge } from '@/components/Badge';

export function Debug() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DebugOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(input.trim());
    if (!Number.isFinite(id) || id <= 0) {
      setError('Ingresá un wpOrderId numérico válido');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = await debugApi.order(id);
      setResult(r);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al consultar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Diagnóstico de pedido</h2>
        <p className="text-sm text-slate-500">
          Compara qué tiene WooCommerce con qué tiene el WMS local para un pedido específico.
          Útil para entender por qué falta una ruta, una bodega, o por qué algo no se sincroniza.
        </p>
      </div>

      <form onSubmit={lookup} className="card flex items-end gap-2 p-3">
        <label className="flex-1">
          <span className="text-xs font-medium text-slate-600">wpOrderId (el ID de WooCommerce)</span>
          <input
            type="text"
            inputMode="numeric"
            className="input mt-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: 1104655"
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={16} />
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {loading && <Spinner />}

      {result && (
        <>
          {/* Diagnóstico interpretado */}
          <div className="card space-y-2 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Diagnóstico</h3>
            {result.diagnosis.map((msg, i) => {
              const isOk = msg.startsWith('Todo coincide');
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ring-1 ${
                    isOk
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      : 'bg-amber-50 text-amber-900 ring-amber-200'
                  }`}
                >
                  {isOk ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  )}
                  <span>{msg}</span>
                </div>
              );
            })}
          </div>

          {/* Comparación lado a lado */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="card p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                WMS local
                {result.local ? (
                  <Badge variant="green">existe</Badge>
                ) : (
                  <Badge variant="amber">no existe</Badge>
                )}
              </h3>
              {result.local ? (
                <dl className="space-y-1 text-xs">
                  <Field k="Número" v={`#${result.local.number}`} />
                  <Field k="Estado" v={result.local.status} />
                  <Field k="Ruta" v={result.local.route ?? '— (null)'} highlight={!result.local.route} />
                  <Field k="Posición carga" v={result.local.stopPosition ?? '—'} />
                  <Field k="Cliente" v={result.local.customerName ?? '—'} />
                  <Field k="Dirección" v={result.local.customerAddress ?? '—'} />
                  <Field k="¿B2 pendiente?" v={result.local.hasB2Pending ? 'Sí' : 'No'} />
                  <Field k="Creado" v={new Date(result.local.createdAt).toLocaleString('es-CL')} />
                  <Field k="Items" v={result.local.items.length} />
                </dl>
              ) : (
                <div className="text-sm text-slate-500">El pedido no está sincronizado en el WMS.</div>
              )}
            </div>

            <div className="card p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                WooCommerce
                {result.wc ? (
                  <Badge variant="blue">leído</Badge>
                ) : (
                  <Badge variant="amber">no leído</Badge>
                )}
              </h3>
              {result.wc ? (
                <dl className="space-y-1 text-xs">
                  <Field k="Número" v={`#${result.wc.number}`} />
                  <Field k="Estado" v={result.wc.status} />
                  <Field
                    k={`Ruta (meta "${result.wc.routeMetaKey}")`}
                    v={result.wc.routeResolved ?? '— (no existe en WC)'}
                    highlight={!result.wc.routeResolved}
                  />
                  <Field
                    k={`Posición (meta "${result.wc.stopPositionMetaKey}")`}
                    v={result.wc.stopPositionResolved ?? '— (no existe en WC)'}
                  />
                  <Field k="Cliente" v={result.wc.billing_name || '—'} />
                  <Field k="Dirección envío" v={result.wc.shipping_address || '—'} />
                  <Field k="Creado en WC" v={result.wc.date_created ? new Date(result.wc.date_created).toLocaleString('es-CL') : '—'} />
                  <Field k="Cantidad de metas" v={result.wc.meta_data_count} />
                  <Field k="Line items" v={result.wc.line_items_count} />
                </dl>
              ) : (
                <div className="text-sm text-red-700">
                  {result.wcError || 'No se pudo leer WC.'}
                </div>
              )}
            </div>
          </div>

          {/* Items locales detallados */}
          {result.local && result.local.items.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Items locales</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="px-2 py-1">productId</th>
                      <th className="px-2 py-1">SKU</th>
                      <th className="px-2 py-1">Nombre</th>
                      <th className="px-2 py-1">Qty</th>
                      <th className="px-2 py-1">Bodega</th>
                      <th className="px-2 py-1">pickedAt</th>
                      <th className="px-2 py-1">packedAt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.local.items.map((it) => (
                      <tr key={it.id} className="border-t border-slate-100">
                        <td className="px-2 py-1 font-mono">{it.productId}</td>
                        <td className="px-2 py-1">{it.sku || '—'}</td>
                        <td className="px-2 py-1">{it.productName || '—'}</td>
                        <td className="px-2 py-1">×{it.qty}</td>
                        <td className="px-2 py-1">
                          <Badge variant={it.warehouse === 'B1' ? 'blue' : 'amber'}>{it.warehouse}</Badge>
                        </td>
                        <td className="px-2 py-1 text-slate-600">{it.pickedAt ? new Date(it.pickedAt).toLocaleString('es-CL') : '—'}</td>
                        <td className="px-2 py-1 text-slate-600">{it.packedAt ? new Date(it.packedAt).toLocaleString('es-CL') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Metas WC completas (collapsible) */}
          {result.wc && result.wc.meta_data.length > 0 && (
            <details className="card p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                Toda la metadata de WC ({result.wc.meta_data_count} items)
              </summary>
              <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
                {JSON.stringify(result.wc.meta_data, null, 2)}
              </pre>
            </details>
          )}

          {/* JSON crudo, para copiar */}
          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              JSON crudo de la respuesta
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

function Field({ k, v, highlight = false }: { k: string; v: string | number | null; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-slate-500">{k}</dt>
      <dd className={`text-right ${highlight ? 'font-semibold text-amber-700' : 'text-slate-800'}`}>{String(v)}</dd>
    </div>
  );
}
