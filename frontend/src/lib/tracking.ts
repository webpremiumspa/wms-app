import { api } from './api';
import type { OrderStatus, Picker, Warehouse } from './types';

export type TrackingEvent = {
  id: number;
  type: string;
  createdAt: string;
  actorId: number | null;
  actor: { wpUserId: number; displayName: string; username: string } | null;
  meta: Record<string, unknown> | null;
};

export type TrackingOrderItem = {
  id: number;
  productId: number;
  qty: number;
  warehouse: Warehouse;
  lineName?: string | null;
  pickedAt: string | null;
  packedAt: string | null;
  product: {
    wpProductId: number;
    sku: string | null;
    name: string;
    thumbnailUrl: string | null;
  } | null;
};

export type TrackingOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  status: OrderStatus;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  customerAddress: string | null;
  shippingMethod: string | null;
  driverId: number | null;
  driverName: string | null;
  vehicle: string | null;
  patente: string | null;
  hasB2Pending: boolean;
  allowPartialDelivery: boolean;
  partialDeliveryNote: string | null;
  bagsExpected: number;
  createdAt: string;
  claimedAt: string | null;
  packedAt: string | null;
  b2ClosedAt: string | null;
  classifiedAt: string | null;
  loadedAt: string | null;
  deliveredAt: string | null;
  updatedAt: string;
  pickedBy: Picker | null;
  packedBy: Picker | null;
  b2ClosedBy: Picker | null;
  sequenceLinks: Array<{
    sequenceId: number;
    sequence?: { id: number; createdAt: string; status: string };
  }>;
  items: TrackingOrderItem[];
};

export type TrackingResponse = {
  order: TrackingOrder;
  timeline: TrackingEvent[];
};

export const trackingApi = {
  byWp: async (wpOrderId: number): Promise<TrackingResponse> =>
    (await api.get(`/orders/by-wp/${wpOrderId}/tracking`)).data,
};
