export type Warehouse = 'B1' | 'B2';

export type OrderStatus =
  | 'received'
  | 'sequenced'
  | 'picked'
  | 'packed'
  | 'classified'
  | 'loaded'
  | 'delivered';

export type SequenceStatus = 'open' | 'closed';

export type SequenceMode = 'by_sku' | 'by_order';

export type PendingOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  customerName: string | null;
  route: string | null;
  hasB2Pending: boolean;
  itemCount: number;
  createdAt: string;
};

export type Sequence = {
  id: number;
  warehouse: Warehouse;
  mode: SequenceMode;
  status: SequenceStatus;
  expectedBags: number;
  actualBags: number;
  createdAt: string;
  closedAt: string | null;
  _count?: { orders: number };
  createdBy?: { displayName: string; username: string };
};

export type SequenceDetail = Sequence & {
  orders: Array<{ orderId: number; order: SequenceOrderInfo }>;
};

export type SequenceOrderInfo = {
  id: number;
  number: string;
  customerName: string | null;
  status: OrderStatus;
  hasB2Pending: boolean;
};

export type PickingReportItem = {
  productId: number;
  sku: string | null;
  name: string;
  thumbnailUrl: string | null;
  qty: number;
  picked: boolean;
};

export type PickingReport = {
  sequence: Sequence;
  items: PickingReportItem[];
  allPicked: boolean;
};

export type PendingPackingOrder = {
  id: number;
  number: string;
  customerName: string | null;
  hasB2Pending: boolean;
  status: OrderStatus;
  ready: boolean;
  itemCount: number;
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
  hasB2Pending: boolean;
  packedAt: string | null;
  packedBy: { displayName: string; username: string } | null;
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
