export type Warehouse = 'B1' | 'B2';

export type OrderStatus =
  | 'received'
  | 'sequenced'
  | 'picked'
  | 'packed'
  | 'classified'
  | 'loaded'
  | 'delivered'
  | 'blocked';

export type SequenceStatus = 'open' | 'closed';

export type PendingOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  route: string | null;
  hasB2Pending: boolean;
  itemCount: number;
  createdAt: string;
};

export type FlowProgress = { total: number; pending: number };

export type Sequence = {
  id: number;
  processId?: number;
  status: SequenceStatus;
  expectedBags: number;
  actualBags: number;
  createdAt: string;
  closedAt: string | null;
  b1ClosedAt: string | null;
  b2ClosedAt: string | null;
  b1?: FlowProgress;
  b2?: FlowProgress;
  _count?: { orders: number };
  createdBy?: { displayName: string; username: string };
};

export type Picker = {
  wpUserId: number;
  displayName: string;
  username: string;
};

export type SequenceDetail = Sequence & {
  orders: Array<{ orderId: number; order: SequenceOrderInfo }>;
};

export type SequenceOrderInfo = {
  id: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  status: OrderStatus;
  hasB2Pending: boolean;
  route: string | null;
  stopPosition: number | null;
};

export type PendingPackingOrder = {
  id: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  route: string | null;
  stopPosition: number | null;
  hasB2Pending: boolean;
  status: OrderStatus;
  itemCount: number;
  claimedAt: string | null;
  pickedBy: Picker | null;
};

export type OrderItem = {
  id: number;
  productId: number;
  qty: number;
  warehouse: Warehouse;
  pickedAt: string | null;
  packedAt: string | null;
  product: {
    wpProductId: number;
    sku: string | null;
    name: string;
    thumbnailUrl: string | null;
  };
};

export type OrderDetail = {
  id: number;
  wpOrderId: number;
  number: string;
  status: OrderStatus;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  customerAddress: string | null;
  shippingMethod: string | null;
  hasB2Pending: boolean;
  allowPartialDelivery: boolean;
  partialDeliveryNote: string | null;
  createdAt?: string; // fecha de WC (cuándo se hizo el pedido)
  packedAt: string | null;
  packedBy: Picker | null;
  pickedBy: Picker | null;
  claimedAt: string | null;
  b2ClosedAt: string | null;
  b2ClosedBy: Picker | null;
  classifiedAt?: string | null;
  loadedAt?: string | null;
  b2Pickable?: boolean;
  sequenceLinks?: Array<{
    sequenceId: number;
    sequence?: { id: number; createdAt: string; status: string };
  }>;
  packable?: boolean;
  openSequenceId?: number | null;
  loadable?: boolean;
  partialApproved?: boolean;
  missingB2Items?: Array<{ productId: number; sku: string | null; name: string | null; qty: number }>;
  blockReason?: string | null;
  sequenceProgress?: {
    sequenceId: number;
    totalActive: number;
    packedCount: number;
    classifiedCount: number;
    pendingPack: number;
    pendingClassify: number;
  } | null;
  items: OrderItem[];
};

export type StockProblem = {
  productId: number;
  sku?: string;
  name?: string;
  required?: number;
  available?: number;
  warning?: string;
  message?: string;
  orders?: Array<{ wpOrderId: number; number: string; qty: number }>;
};
