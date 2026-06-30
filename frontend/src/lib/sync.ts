import { api } from './api';

export type SyncResult = {
  total: number;
  synced: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ wpOrderId: number; message: string }>;
  orders: Array<{ wpOrderId: number; number: string; status: string; isNew: boolean; skipped: boolean }>;
  skippedOrders: Array<{ wpOrderId: number; number: string; status: string }>;
  takenBySequences: Array<{
    id: number;
    status: 'open' | 'closed';
    orders: Array<{ wpOrderId: number; number: string }>;
  }>;
  range: { after: string; before: string | null };
  statuses: string[];
};

export type SyncParams = {
  after?: string; // YYYY-MM-DD o ISO
  before?: string;
  statuses?: string[];
  forceProductRefresh?: boolean;
};

export type RoutesSyncResult = {
  ok: boolean;
  total: number;
  updated: number;
  failed?: number;
  errors?: Array<{ wpOrderId: number; message: string }>;
  // Eco del processId enviado. null si el caller pidió refresh global (todos
  // los procesos). El frontend lo usa para mostrar contexto en el banner.
  processId: number | null;
};

export const syncApi = {
  orders: async (params: SyncParams): Promise<SyncResult> =>
    (await api.post('/sync/orders', params)).data,
  // Si se pasa processId, el backend acota el refresh a los pedidos de ese
  // proceso. Sin processId refresca todos los pedidos activos del WMS.
  routes: async (opts?: { processId?: number }): Promise<RoutesSyncResult> =>
    (await api.post('/sync/routes', null, {
      params: opts?.processId ? { processId: opts.processId } : undefined,
    })).data,
};
