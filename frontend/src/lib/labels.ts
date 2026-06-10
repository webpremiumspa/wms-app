import type { OrderStatus, SequenceStatus } from './types';

// Mapeo único de los enums internos (en inglés en BD) a su display en español.
// Si querés cambiar el wording en toda la app, se hace acá y se propaga.
// Los enums internos NO se traducen — solo el texto que ve el operador.

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recibido',
  sequenced: 'En secuencia',
  picked: 'Recolectado',
  packed: 'Empacado',
  classified: 'Clasificado',
  loaded: 'Cargado',
  delivered: 'Entregado',
  blocked: 'Bloqueado',
};

// Plural (para KPIs / contadores en dashboards).
export const ORDER_STATUS_LABELS_PLURAL: Record<OrderStatus, string> = {
  received: 'Recibidos',
  sequenced: 'En secuencia',
  picked: 'Recolectados',
  packed: 'Empacados',
  classified: 'Clasificados',
  loaded: 'Cargados',
  delivered: 'Entregados',
  blocked: 'Bloqueados',
};

// Motivos válidos para remover un pedido de la secuencia (auditoría).
export const REMOVE_REASON_LABELS: Record<string, string> = {
  sin_stock_b1: 'Sin stock B1',
  sin_stock_b2: 'Sin stock B2',
  producto_danado: 'Producto dañado',
  cliente_cancelo: 'Cliente canceló',
  otro: 'Otro motivo',
};

export const SEQUENCE_STATUS_LABELS: Record<SequenceStatus, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
};

// Texto humano de los eventos del log (dashboard de supervisión).
export const EVENT_LABELS: Record<string, string> = {
  'sequence.created': 'creó secuencia',
  'sequence.item_picked': 'recolectó item',
  'sequence.item_unpicked': 'deshizo recolección',
  'sequence.b1_closed': 'cerró flujo B1',
  'sequence.b2_closed': 'cerró flujo B2',
  'sequence.closed': 'cerró secuencia',
  'sequence.deleted': 'eliminó secuencia',
  'sequence.order_removed': 'removió pedido de secuencia',
  'order.claimed': 'tomó pedido para empacar',
  'order.claim_reassigned': 'reasignó pedido (otro picker lo tenía)',
  'order.packed': 'empacó pedido',
  'order.unblocked': 'reactivó pedido',
  'order.partial_delivery_approved': 'aprobó entrega parcial',
  'order.partial_delivery_revoked': 'revocó entrega parcial',
  'picking_b2.item_picked': 'recolectó item B2',
  'picking_b2.item_unpicked': 'deshizo recolección B2',
  'dispatch.classified': 'clasificó pedido',
  'dispatch.loaded': 'cargó pedido',
  'delivery.scanned': 'escaneó en entrega',
};

// Helpers tolerantes a strings desconocidos (siempre devuelven algo legible).
export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}

export function orderStatusLabelPlural(status: string): string {
  return ORDER_STATUS_LABELS_PLURAL[status as OrderStatus] || status;
}

export function sequenceStatusLabel(status: string): string {
  return SEQUENCE_STATUS_LABELS[status as SequenceStatus] || status;
}

export function eventLabel(type: string): string {
  return EVENT_LABELS[type] || type;
}
