import { api } from './api';
import type {
  PendingOrder,
  Sequence,
  SequenceDetail,
  PendingPackingOrder,
  StockProblem,
  OrderDetail,
  DeliveryStatus,
  DeliveryMeta,
  OrderStatus,
} from './types';

// v0.25.10: pedido con delivery_status='returned' pendiente de revive.
export type ReturnedOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  customerName: string | null;
  customerCity: string | null;
  route: string | null;
  stopPosition: number | null;
  status: OrderStatus;
  hasB2Pending: boolean;
  hasB1Items: boolean;
  deliveryStatus: DeliveryStatus;
  deliveryMeta: DeliveryMeta;
  deliveryStatusUpdatedAt: string | null;
  wcStatus?: string | null;
  loadedAt: string | null;
  packedAt: string | null;
  createdAt: string;
  sequenceLinks: Array<{
    sequenceId: number;
    sequenceCreatedAt?: string;
    processId?: number;
    processName?: string;
  }>;
};

export const sequencesApi = {
  list: async (opts?: { limit?: number }): Promise<Sequence[]> =>
    (await api.get('/sequences', { params: opts ? { limit: opts.limit } : undefined })).data.sequences,

  get: async (id: number): Promise<SequenceDetail> => (await api.get(`/sequences/${id}`)).data.sequence,

  pendingPacking: async (id: number): Promise<PendingPackingOrder[]> =>
    (await api.get(`/sequences/${id}/pending-packing`)).data.orders,

  pendingOrders: async (): Promise<{ orders: PendingOrder[]; total: number; limit: number; truncated: boolean }> => {
    const r = await api.get('/orders/pending');
    return {
      orders: r.data.orders,
      total: r.data.total ?? r.data.orders.length,
      limit: r.data.limit ?? r.data.orders.length,
      truncated: !!r.data.truncated,
    };
  },

  clearPending: async (): Promise<{ deleted: number }> =>
    (await api.delete('/orders/pending')).data,

  validateStock: async (orderIds: number[]): Promise<StockProblem[]> =>
    (await api.post('/sequences/validate-stock', { orderIds })).data.problems,

  create: async (orderIds: number[], processId?: number): Promise<Sequence> =>
    (await api.post('/sequences', { orderIds, processId })).data.sequence,

  closeB1: async (id: number, actualBags?: number): Promise<Sequence> =>
    (await api.post(`/sequences/${id}/close-b1`, actualBags !== undefined ? { actualBags } : {})).data.sequence,

  // Descarga el PDF con los albaranes de la secuencia y lo abre en una
  // pestaña nueva. Cada albarán es una página (los pickers escanean el QR).
  // Si `excludeOnlyB2` es true, omite pedidos sin items B1 (su picking se
  // hace desde el celular, no necesitan impresión).
  openAlbaranesBatch: async (id: number, opts?: { excludeOnlyB2?: boolean }): Promise<void> => {
    const res = await api.get(`/sequences/${id}/albaranes.pdf`, {
      responseType: 'blob',
      params: opts?.excludeOnlyB2 ? { excludeOnlyB2: '1' } : undefined,
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },

  delete: async (id: number): Promise<{ ok: boolean; ordersReverted: number }> =>
    (await api.delete(`/sequences/${id}`)).data,

  removeOrder: async (
    sequenceId: number,
    orderId: number,
    reasonCode: string,
    reasonText?: string,
  ): Promise<{ ok: boolean }> =>
    (await api.delete(`/sequences/${sequenceId}/orders/${orderId}`, {
      data: { reasonCode, reasonText },
    })).data,
};

export type MissingB2Item = {
  productId: number;
  sku: string | null;
  name: string | null;
  qty: number;
};

export type OrderLoadability = {
  loadable: boolean;
  partialApproved: boolean;
  partialDeliveryNote?: string | null;
  missingB2Items: MissingB2Item[];
  reason?: string;
};

// Resultado de búsqueda global de pedidos (substring match sobre `number`).
// Aparece cuando el supervisor busca un pedido desde el índice de Procesos:
// devuelve el proceso/secuencia donde vive el pedido (o null si todavía no
// entró a ninguno).
export type OrderSearchMatch = {
  id: number;
  wpOrderId: number;
  number: string;
  status: import('./types').OrderStatus;
  customerName: string | null;
  route: string | null;
  stopPosition: number | null;
  hasB2Pending: boolean;
  createdAt: string;
  sequenceId: number | null;
  sequenceStatus: 'open' | 'closed' | null;
  processId: number | null;
  processName: string | null;
  processStatus: 'open' | 'closed' | null;
};

export const ordersApi = {
  get: async (id: number): Promise<OrderDetail> => (await api.get(`/orders/${id}`)).data.order,

  // Búsqueda global por substring del number. Atraviesa procesos abiertos y
  // cerrados — el supervisor lo usa para ubicar un pedido sin saber a qué
  // proceso pertenece.
  search: async (query: string, limit = 20): Promise<{ matches: OrderSearchMatch[]; total: number; query: string }> =>
    (await api.get('/orders/search', { params: { q: query, limit } })).data,
  getByWpId: async (wpOrderId: number): Promise<OrderDetail> =>
    (await api.get(`/orders/by-wp/${wpOrderId}`)).data.order,

  // Versión pública del endpoint anterior — no requiere auth.
  // Usada por el scan del QR para que la cámara del móvil abra el navegador
  // sin obligar a loguearse antes de ver el contenido del pedido.
  getPublicByWpId: async (wpOrderId: number): Promise<OrderDetail> =>
    (await api.get(`/public/orders/${wpOrderId}`)).data.order,
  pack: async (
    id: number,
    itemIds: number[],
    confirmedOldSequence?: boolean,
    bagsExpected?: number,
  ): Promise<void> => {
    await api.post(`/orders/${id}/pack`, { itemIds, confirmedOldSequence, bagsExpected });
  },
  // Multi-bulto pack plan (v0.24.0)
  createPackPlan: async (
    id: number,
    bagsExpected: number,
    // v0.24.2: cada assignment incluye qty. Un item con qty>1 puede
    // aparecer en varias asignaciones si se divide entre bultos.
    assignments: Array<{ orderItemId: number; bagNumber: number; qty: number }>,
  ): Promise<{ ok: boolean; bagsExpected: number; assignmentCount: number }> =>
    (await api.post(`/orders/${id}/pack-plan`, { bagsExpected, assignments })).data,
  deletePackPlan: async (id: number): Promise<{ ok: boolean; deleted: number }> =>
    (await api.delete(`/orders/${id}/pack-plan`)).data,
  closePackBag: async (
    id: number,
    bag: number,
    itemIds: number[],
  ): Promise<{ ok: boolean; complete: boolean; progress: { done: number; total: number }; transitionedNow: boolean }> =>
    (await api.post(`/orders/${id}/pack/${bag}/close`, { itemIds })).data,
  updateBags: async (
    id: number,
    bagsExpected: number,
  ): Promise<{ ok: boolean; bagsExpected: number; changed: boolean }> =>
    (await api.put(`/orders/${id}/bags`, { bagsExpected })).data,
  packB2: async (id: number, itemIds: number[], confirmedOldSequence?: boolean): Promise<{ ok: boolean; closedSequences: number[] }> =>
    (await api.post(`/orders/${id}/pack-b2`, { itemIds, confirmedOldSequence })).data,
  loadability: async (id: number): Promise<OrderLoadability> =>
    (await api.get(`/orders/${id}/loadability`)).data,
  approvePartialDelivery: async (id: number, note?: string): Promise<{ ok: boolean }> =>
    (await api.post(`/orders/${id}/partial-delivery`, { note })).data,
  revokePartialDelivery: async (id: number): Promise<{ ok: boolean }> =>
    (await api.delete(`/orders/${id}/partial-delivery`)).data,
  unblock: async (id: number): Promise<{ ok: boolean }> =>
    (await api.post(`/orders/${id}/unblock`)).data,
  // Desempaca un pedido cerrado por error: vuelve a 'sequenced' y limpia
  // los timestamps de pack/picker (otro picker puede tomarlo de nuevo).
  // Falla si el pedido ya fue cargado o entregado.
  unpack: async (id: number): Promise<{ ok: boolean }> =>
    (await api.post(`/orders/${id}/unpack`)).data,
  // Revertir un paso (v0.25.1, solo SUPERVISE). Retrocede el pedido UN
  // estado: loaded→classified, classified→packed, packed→sequenced.
  // Encadenable — el supervisor puede tocar varias veces para ir más atrás.
  revertStep: async (id: number): Promise<{
    ok: boolean;
    from: 'packed' | 'classified' | 'loaded';
    to: 'sequenced' | 'packed' | 'classified';
    bagEventsCleared: number;
  }> => (await api.post(`/orders/${id}/revert-step`)).data,
  // v0.25.10: revivir un pedido devuelto (solo SUPERVISE, requiere
  // status='loaded' + delivery_status='returned'). Reset a 'received',
  // preserva chip como 'revived'. Todo auditado en events.
  reviveFromReturn: async (id: number): Promise<{ ok: boolean; orderId: number }> =>
    (await api.post(`/orders/${id}/revive-from-return`)).data,
  // Lista de pedidos con delivery_status='returned' + status='loaded'
  // pendientes de revive. Solo SUPERVISE.
  listReturned: async (): Promise<ReturnedOrder[]> =>
    (await api.get('/orders/returned')).data.orders,
  // Reabre el cierre B2: limpia b2ClosedAt y los items B2 vuelven a no
  // pickeados. Independiente del flujo B1.
  reopenB2: async (id: number): Promise<{ ok: boolean }> =>
    (await api.post(`/orders/${id}/reopen-b2`)).data,
  // Claim: el picker toma el pedido para empacarlo. Modelo "último escaneo
  // gana" — siempre reasigna al actor que llama.
  claim: async (
    id: number,
  ): Promise<{
    ok: boolean;
    alreadyClaimed?: boolean;
    claimedAt?: string;
    reassignedFrom?: { wpUserId: number; displayName: string; username: string } | null;
  }> => (await api.post(`/orders/${id}/claim`)).data,
  // Descarga el PDF con el header Authorization (que window.open no enviaría)
  // y lo abre en una nueva pestaña como blob. Si se pasa `bags`, el backend
  // imprime N páginas pre-numeradas "BULTO 1 DE N..." sin guardar el cambio.
  openAlbaran: async (id: number, opts?: { bags?: number }): Promise<void> => {
    const res = await api.get(`/orders/${id}/albaran.pdf`, {
      responseType: 'blob',
      params: opts?.bags ? { bags: opts.bags } : undefined,
    });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
