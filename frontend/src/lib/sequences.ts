import { api } from './api';
import type {
  PendingOrder,
  Sequence,
  SequenceDetail,
  PickingReport,
  PendingPackingOrder,
  StockProblem,
  OrderDetail,
  Warehouse,
} from './types';

export const sequencesApi = {
  list: async (): Promise<Sequence[]> => (await api.get('/sequences')).data.sequences,

  get: async (id: number): Promise<SequenceDetail> => (await api.get(`/sequences/${id}`)).data.sequence,

  pickingReport: async (id: number): Promise<PickingReport> =>
    (await api.get(`/sequences/${id}/picking-report`)).data,

  pendingPacking: async (id: number): Promise<PendingPackingOrder[]> =>
    (await api.get(`/sequences/${id}/pending-packing`)).data.orders,

  pendingOrders: async (): Promise<PendingOrder[]> => (await api.get('/orders/pending')).data.orders,

  clearPending: async (): Promise<{ deleted: number }> =>
    (await api.delete('/orders/pending')).data,

  validateStock: async (orderIds: number[]): Promise<StockProblem[]> =>
    (await api.post('/sequences/validate-stock', { orderIds })).data.problems,

  create: async (
    warehouse: Warehouse,
    orderIds: number[],
    mode: 'by_sku' | 'by_order' = 'by_sku',
  ): Promise<Sequence> =>
    (await api.post('/sequences', { warehouse, orderIds, mode })).data.sequence,

  markPicked: async (id: number, productId: number, picked: boolean): Promise<void> => {
    await api.patch(`/sequences/${id}/picking`, { productId, picked });
  },

  close: async (id: number, actualBags?: number): Promise<Sequence> =>
    (await api.post(`/sequences/${id}/close`, actualBags !== undefined ? { actualBags } : {})).data.sequence,

  delete: async (id: number): Promise<{ ok: boolean; ordersReverted: number }> =>
    (await api.delete(`/sequences/${id}`)).data,
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
  pack: async (id: number, itemIds: number[]): Promise<void> => {
    await api.post(`/orders/${id}/pack`, { itemIds });
  },
  // Descarga el PDF con el header Authorization (que window.open no enviaría)
  // y lo abre en una nueva pestaña como blob.
  openAlbaran: async (id: number): Promise<void> => {
    const res = await api.get(`/orders/${id}/albaran.pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
