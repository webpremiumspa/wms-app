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

// Contexto de la última remoción del pedido de una secuencia. Aparece en la
// vista de pendientes (pedidos que están en `received` pero ya pasaron por
// el flujo y fueron rescatados) para que el supervisor decida si vuelve a
// incluirlo en la próxima secuencia.
export type LastRemovalInfo = {
  at: string;
  reasonCode: string | null;
  reasonText: string | null;
  previousStatus: string | null;
  sequenceId: number | null;
  processId: number | null;
};

export type PendingOrder = {
  id: number;
  wpOrderId: number;
  number: string;
  customerName: string | null;
  shippingMethod: string | null;
  route: string | null;
  hasB2Pending: boolean;
  // Estado WC tal cual (slug). Refrescado por webhook order.updated; sirve
  // como chip de contexto en la UI: independiente del status interno WMS.
  wcStatus?: string | null;
  wcStatusUpdatedAt?: string | null;
  itemCount: number;
  createdAt: string;
  lastRemoval?: LastRemovalInfo | null;
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
  // Estado WC tal cual (slug). Para chip de contexto.
  wcStatus?: string | null;
  wcStatusUpdatedAt?: string | null;
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
  // Nombre del line_item de WC al momento de sync — incluye variante si la hay.
  // Si difiere de product.name, la UI debería mostrarlo (es el dato canónico
  // del pedido).
  lineName?: string | null;
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
  // Estado WC tal cual (slug). Para chip de contexto independiente del
  // status interno del WMS. Refrescado por webhook order.updated.
  wcStatus?: string | null;
  wcStatusUpdatedAt?: string | null;
  route: string | null;
  stopPosition: number | null;
  customerName: string | null;
  // Dirección dividida: address_1 (calle + número), address_2 (depto),
  // city (comuna), phone (teléfono). Cliente reciente; pedidos viejos
  // pueden tener todo concatenado en customerAddress hasta re-sync.
  customerAddress: string | null;
  customerAddress2?: string | null;
  customerCity?: string | null;
  customerPhone?: string | null;
  customerNote?: string | null;
  shippingMethod: string | null;
  hasB2Pending: boolean;
  allowPartialDelivery: boolean;
  partialDeliveryNote: string | null;
  // Bultos físicos generados al empacar (default 1). Si >1 el albarán se
  // imprime numerado "1 de N, 2 de N, ..." y la UI muestra banners de
  // verificación al clasificar/cargar.
  bagsExpected?: number;
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
    sequence?: { id: number; createdAt: string; status: string; processId?: number };
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
