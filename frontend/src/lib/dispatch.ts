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
  orders: Array<{ id: number; number: string; route: string; stopPosition: number | null; status: string; hasB2Pending: boolean }>;
};

export const pickingB2Api = {
  summary: async (): Promise<B2PickingSummaryRow[]> =>
    (await api.get('/picking/b2/summary')).data.sequences,

  forSequence: async (sequenceId: number): Promise<B2PickingList> =>
    (await api.get(`/picking/b2/sequences/${sequenceId}`)).data,
};

export const dispatchApi = {
  scan: async (qr: string): Promise<DispatchOrder> => (await api.post('/dispatch/scan', { qr })).data.order,
  loaded: async (orderId: number): Promise<void> => {
    await api.post(`/dispatch/${orderId}/loaded`);
  },
  today: async (): Promise<RouteSummary[]> => (await api.get('/dispatch/today')).data.routes,
};

