import { api } from './api';
import type { Sequence } from './types';

export type B2PickingSummaryRow = {
  sequenceId: number;
  createdAt: string;
  totalOrders: number;
  pendingOrders: number;
};

export type B2PendingPackingOrder = {
  id: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  route: string | null;
  stopPosition: number | null;
  status: string;
  itemCount: number;
  pickedCount: number;
  b2ClosedAt: string | null;
  b2ClosedBy: { wpUserId: number; displayName: string; username: string } | null;
};

export type B2PickingList = {
  sequence: Sequence;
  orders: B2PendingPackingOrder[];
};

export type DispatchOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  status: string;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  customerAddress: string | null;
  customerNote?: string | null;
  shippingMethod: string | null;
  hasB2Pending: boolean;
  loadedAt: string | null;
  loadable: boolean;
  partialApproved: boolean;
  partialDeliveryNote: string | null;
  missingB2Items: Array<{ productId: number; sku: string | null; name: string | null; qty: number }>;
  blockReason: string | null;
};

export type RouteSummary = {
  route: string;
  total: number;
  classified: number;
  loaded: number;
  b2Count: number;
  // Multi-bulto: conteos por bulto de toda la ruta. bagsTotal es la suma de
  // bagsExpected de todos los pedidos; bagsClassified/bagsLoaded contabilizan
  // los bultos registrados. Solo tienen valor cuando hay pedidos multi-bulto
  // — el frontend los usa para mostrar sub-línea "1/3 bultos".
  bagsTotal?: number;
  bagsClassified?: number;
  bagsLoaded?: number;
  orders: Array<{ id: number; number: string; route: string; stopPosition: number | null; status: string; hasB2Pending: boolean }>;
};

export type B2DaySummaryRow = {
  productId: number;
  sku: string | null;
  name: string;
  thumbnailUrl: string | null;
  totalQty: number;
  pendingQty: number;
  orders: Array<{ wpOrderId: number; number: string; qty: number; done: boolean }>;
};

export type B2DayOrderRow = B2PendingPackingOrder & {
  sequenceId: number | null;
  sequenceCreatedAt: string | null;
};

export type B2DayResponse = {
  orders: B2DayOrderRow[];
  summary: B2DaySummaryRow[];
};

export const pickingB2Api = {
  summary: async (): Promise<B2PickingSummaryRow[]> =>
    (await api.get('/picking/b2/summary')).data.sequences,

  forSequence: async (sequenceId: number): Promise<B2PickingList> =>
    (await api.get(`/picking/b2/sequences/${sequenceId}`)).data,

  today: async (opts?: { processId?: number }): Promise<B2DayResponse> =>
    (await api.get('/picking/b2/today', {
      params: opts?.processId ? { processId: opts.processId } : undefined,
    })).data,
};

// Equivalente B1 de la vista del día. Misma forma de response pero los items
// reportados son los B1 y `b1ClosedAt` (= packedAt del pedido) reemplaza a
// `b2ClosedAt`. Útil como guía de recorrido de Bodega 1 antes de empacar.
export type B1DayOrderRow = {
  id: number;
  wpOrderId: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  route: string | null;
  stopPosition: number | null;
  status: string;
  itemCount: number;
  pickedCount: number;
  b1ClosedAt: string | null;
  sequenceId: number | null;
  sequenceCreatedAt: string | null;
};

export type B1DayResponse = {
  orders: B1DayOrderRow[];
  summary: B2DaySummaryRow[];
};

export const pickingB1Api = {
  today: async (opts?: { processId?: number }): Promise<B1DayResponse> =>
    (await api.get('/picking/b1/today', {
      params: opts?.processId ? { processId: opts.processId } : undefined,
    })).data,
};

// Multi-bulto: cuando el endpoint clasifica/carga UN bulto, devuelve el
// progreso actual (done/total) y si el pedido se completó con este scan.
export type BagActionResult = {
  ok: boolean;
  complete: boolean;
  progress: { done: number; total: number };
  transitionedNow?: boolean;
  alreadyClassified?: boolean;
  alreadyLoaded?: boolean;
};

export const dispatchApi = {
  scan: async (qr: string): Promise<DispatchOrder> => (await api.post('/dispatch/scan', { qr })).data.order,
  // bag opcional: si es multi-bulto (bagsExpected>1) hay que pasarlo. En
  // single-bulto se puede omitir (el backend asume bag=1).
  classify: async (orderId: number, bag?: number): Promise<BagActionResult> =>
    (await api.post(`/dispatch/${orderId}/classify`, bag != null ? { bag } : {})).data,
  loaded: async (orderId: number, bag?: number): Promise<BagActionResult> =>
    (await api.post(`/dispatch/${orderId}/loaded`, bag != null ? { bag } : {})).data,
  // Deshacer bulto — solo dentro de la ventana 30s desde el registro y por el
  // mismo actor. Devuelve el progreso actualizado.
  undoBag: async (
    orderId: number,
    bag: number,
    event: 'classified' | 'loaded',
  ): Promise<{ ok: boolean; progress: { done: number; total: number }; revertedStatus: boolean }> =>
    (await api.post(`/dispatch/${orderId}/bag/${bag}/undo`, null, { params: { event } })).data,
  today: async (): Promise<RouteSummary[]> => (await api.get('/dispatch/today')).data.routes,
};

