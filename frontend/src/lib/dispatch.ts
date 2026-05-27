import { api } from './api';
import type { Sequence } from './types';

export type B2PickingItem = {
  productId: number;
  sku: string | null;
  name: string;
  thumbnailUrl: string | null;
  qty: number;
  picked: boolean;
  ordersCount: number;
};

export type B2PickingReport = {
  sequence: Sequence;
  items: B2PickingItem[];
  allPicked: boolean;
  totalSkus: number;
};

export type B2PickingBatchReport = {
  sequenceIds: number[];
  items: B2PickingItem[];
  allPicked: boolean;
  totalSkus: number;
};

export type B2BatchCloseResult = {
  closed: number[];
  stillPending: Array<{ sequenceId: number; total: number; pending: number }>;
};

export type B2PickingSummaryRow = {
  sequenceId: number;
  createdAt: string;
  ordersCount: number;
  totalItems: number;
  pendingItems: number;
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
  hasB2Pending: boolean;
  loadedAt: string | null;
};

export type DeliveryItem = {
  id: number;
  qty: number;
  sku: string | null;
  name: string;
  thumbnailUrl: string | null;
};

export type DeliveryOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  customerAddress: string | null;
  hasB2Pending: boolean;
  b1Items: DeliveryItem[];
  b2Items: DeliveryItem[];
};

export type RouteSummary = {
  route: string;
  total: number;
  classified: number;
  loaded: number;
  b2Count: number;
  orders: Array<{ id: number; number: string; route: string; stopPosition: number | null; status: string; hasB2Pending: boolean }>;
};

export const pickingB2Api = {
  summary: async (): Promise<B2PickingSummaryRow[]> =>
    (await api.get('/picking/b2/summary')).data.sequences,

  forSequence: async (sequenceId: number): Promise<B2PickingReport> =>
    (await api.get(`/picking/b2/sequences/${sequenceId}`)).data,

  mark: async (sequenceId: number, productId: number, picked: boolean): Promise<void> => {
    await api.patch(`/picking/b2/sequences/${sequenceId}`, { productId, picked });
  },

  closeB2: async (sequenceId: number): Promise<Sequence> =>
    (await api.post(`/picking/b2/sequences/${sequenceId}/close`)).data.sequence,

  batchReport: async (sequenceIds: number[]): Promise<B2PickingBatchReport> =>
    (await api.get('/picking/b2/batch', { params: { ids: sequenceIds.join(',') } })).data,

  batchMark: async (sequenceIds: number[], productId: number, picked: boolean): Promise<void> => {
    await api.patch('/picking/b2/batch', { sequenceIds, productId, picked });
  },

  batchClose: async (sequenceIds: number[]): Promise<B2BatchCloseResult> =>
    (await api.post('/picking/b2/batch/close', { sequenceIds })).data,
};

export const dispatchApi = {
  scan: async (qr: string): Promise<DispatchOrder> => (await api.post('/dispatch/scan', { qr })).data.order,
  loaded: async (orderId: number): Promise<void> => {
    await api.post(`/dispatch/${orderId}/loaded`);
  },
  today: async (): Promise<RouteSummary[]> => (await api.get('/dispatch/today')).data.routes,
};

export const deliveryApi = {
  scan: async (qr: string): Promise<DeliveryOrder> => (await api.post('/delivery/scan', { qr })).data.order,
};
