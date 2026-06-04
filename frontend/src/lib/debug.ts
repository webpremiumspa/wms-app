import { api } from './api';

export type DebugOrderResponse = {
  wpOrderId: number;
  configKeys: { orderRoute: string; orderStopPosition: string };
  local: {
    id: number;
    wpOrderId: number;
    number: string;
    status: string;
    route: string | null;
    stopPosition: number | null;
    customerName: string | null;
    customerAddress: string | null;
    hasB2Pending: boolean;
    createdAt: string;
    packedAt: string | null;
    items: Array<{
      id: number;
      productId: number;
      productName: string | null;
      sku: string | null;
      qty: number;
      warehouse: 'B1' | 'B2';
      pickedAt: string | null;
      packedAt: string | null;
    }>;
  } | null;
  wc: {
    id: number;
    number: string | number;
    status: string;
    date_created: string;
    billing_name: string;
    shipping_address: string;
    meta_data_count: number;
    meta_data: Array<{ id?: number; key: string; value: unknown }>;
    routeMetaKey: string;
    routeMetaFound: { key: string; value: unknown } | null;
    routeResolved: string | null;
    stopPositionMetaKey: string;
    stopPositionMetaFound: { key: string; value: unknown } | null;
    stopPositionResolved: string | number | null;
    line_items_count: number;
    line_items: Array<{ product_id: number; name: string; quantity: number; sku: string | null }>;
  } | null;
  wcError: string | null;
  diagnosis: string[];
};

export const debugApi = {
  order: async (wpOrderId: number): Promise<DebugOrderResponse> =>
    (await api.get(`/orders/debug-order/${wpOrderId}`)).data,
};
