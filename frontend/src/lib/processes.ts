import { api } from './api';
import type { OrderStatus } from './types';

export type ProcessStatus = 'open' | 'closed';

export type DeliveryProcess = {
  id: number;
  name: string;
  scheduledAt: string | null;
  createdAt: string;
  closedAt: string | null;
  status: ProcessStatus;
  createdBy?: { wpUserId: number; displayName: string; username: string };
  _count?: { sequences: number };
};

export type ProcessSequenceSummary = {
  id: number;
  createdAt: string;
  status: 'open' | 'closed';
  b1ClosedAt: string | null;
  b2ClosedAt: string | null;
  closedAt: string | null;
  expectedBags: number;
  actualBags: number;
  orderCount: number;
};

export type ProcessOrderCard = {
  id: number;
  wpOrderId: number;
  number: string;
  status: OrderStatus;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  shippingMethod: string | null;
  hasB2Pending: boolean;
  sequenceId: number;
};

export type ProcessDetail = {
  process: DeliveryProcess & { sequences: ProcessSequenceSummary[] };
  orders: ProcessOrderCard[];
  byStatus: Record<OrderStatus, number>;
  totals: { orders: number; sequences: number };
};

export const processesApi = {
  list: async (opts?: { limit?: number }): Promise<DeliveryProcess[]> =>
    (await api.get('/processes', { params: opts })).data.processes,

  active: async (): Promise<DeliveryProcess | null> =>
    (await api.get('/processes/active')).data.process,

  get: async (id: number): Promise<ProcessDetail> =>
    (await api.get(`/processes/${id}`)).data,

  create: async (input: { name: string; scheduledAt?: string }): Promise<DeliveryProcess> =>
    (await api.post('/processes', input)).data.process,

  close: async (id: number): Promise<{ ok: boolean; alreadyClosed?: boolean }> =>
    (await api.post(`/processes/${id}/close`)).data,
};
