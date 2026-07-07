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
  // Nombre del repartidor asignado a la ruta (viene del meta _wdg_driver_name
  // sincronizado desde WC). Opcional — pedidos viejos o sin ruta pueden no
  // tenerlo. Se usa para etiquetar chips del filtro rápido "R1 - Juan".
  driverName?: string | null;
  customerName: string | null;
  shippingMethod: string | null;
  hasB2Pending: boolean;
  // Timestamps por bodega: el kanban los usa para detectar "Parcial"
  // (un flujo cerrado y el otro no) y para pintar los pills B1/B2 en
  // cada card. Null = ese lado todavía no está cerrado.
  packedAt: string | null;
  b2ClosedAt: string | null;
  // Multi-bulto: cuántos bultos ya se registraron como classified/loaded
  // (0..bagsExpected). Se usa para pintar el badge "2/3 bultos" en la card
  // del kanban cuando el pedido está a medio camino.
  bagsExpected?: number;
  bagsClassifiedCount?: number;
  bagsLoadedCount?: number;
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

  // Legacy: 1 proceso. Para casos donde sí se quiere lista, usar openList.
  active: async (): Promise<DeliveryProcess | null> =>
    (await api.get('/processes/active')).data.process,

  // Devuelve todos los procesos abiertos (sin tope de cantidad).
  openList: async (): Promise<DeliveryProcess[]> =>
    (await api.get('/processes/open')).data.processes,

  get: async (id: number): Promise<ProcessDetail> =>
    (await api.get(`/processes/${id}`)).data,

  create: async (input: { name: string; scheduledAt?: string }): Promise<DeliveryProcess> =>
    (await api.post('/processes', input)).data.process,

  close: async (id: number): Promise<{ ok: boolean; alreadyClosed?: boolean }> =>
    (await api.post(`/processes/${id}/close`)).data,
};
