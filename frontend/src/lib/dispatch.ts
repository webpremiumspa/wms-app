import { api } from './api';

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
  items: B2PickingItem[];
  allPicked: boolean;
  totalSkus: number;
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
  today: async (): Promise<B2PickingReport> => (await api.get('/picking/b2/today')).data,
  mark: async (productId: number, picked: boolean): Promise<void> => {
    await api.patch(`/picking/b2/today/${productId}`, { picked });
  },
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
