import { api } from './api';
import type {
  PendingOrder,
  Sequence,
  SequenceDetail,
  PendingPackingOrder,
  StockProblem,
  OrderDetail,
} from './types';

export const sequencesApi = {
  list: async (): Promise<Sequence[]> => (await api.get('/sequences')).data.sequences,

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

  create: async (orderIds: number[]): Promise<Sequence> =>
    (await api.post('/sequences', { orderIds })).data.sequence,

  closeB1: async (id: number, actualBags?: number): Promise<Sequence> =>
    (await api.post(`/sequences/${id}/close-b1`, actualBags !== undefined ? { actualBags } : {})).data.sequence,

  // Descarga el PDF con TODOS los albaranes de la secuencia y lo abre en una
  // pestaña nueva. Cada albarán es una página (los pickers escanean el QR).
  openAlbaranesBatch: async (id: number): Promise<void> => {
    const res = await api.get(`/sequences/${id}/albaranes.pdf`, { responseType: 'blob' });
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

export const ordersApi = {
  get: async (id: number): Promise<OrderDetail> => (await api.get(`/orders/${id}`)).data.order,
  getByWpId: async (wpOrderId: number): Promise<OrderDetail> =>
    (await api.get(`/orders/by-wp/${wpOrderId}`)).data.order,

  // Versión pública del endpoint anterior — no requiere auth.
  // Usada por el scan del QR para que la cámara del móvil abra el navegador
  // sin obligar a loguearse antes de ver el contenido del pedido.
  getPublicByWpId: async (wpOrderId: number): Promise<OrderDetail> =>
    (await api.get(`/public/orders/${wpOrderId}`)).data.order,
  pack: async (id: number, itemIds: number[], confirmedOldSequence?: boolean): Promise<void> => {
    await api.post(`/orders/${id}/pack`, { itemIds, confirmedOldSequence });
  },
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
  // y lo abre en una nueva pestaña como blob.
  openAlbaran: async (id: number): Promise<void> => {
    const res = await api.get(`/orders/${id}/albaran.pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
