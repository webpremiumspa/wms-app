-- Migración: Pedidos bloqueados + entrega parcial aprobada
-- Fecha: 2026-06-05
--
-- Cambios:
--   * Order: AGREGA allow_partial_delivery BOOLEAN DEFAULT FALSE
--   * Order: AGREGA partial_delivery_note VARCHAR(500) NULL
--   * OrderStatus: AGREGA valor 'blocked' al enum
--
-- IMPORTANTE: ejecutar ANTES del deploy. Los valores existentes quedan
-- intactos (allow_partial_delivery=false, partial_delivery_note=NULL).

ALTER TABLE orders
  ADD COLUMN allow_partial_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN partial_delivery_note VARCHAR(500) NULL;

-- Extender el enum de status. MySQL no permite ALTER directo del enum,
-- hay que redefinirlo con todos los valores.
ALTER TABLE orders MODIFY COLUMN status
  ENUM('received','sequenced','picked','packed','classified','loaded','delivered','blocked')
  NOT NULL DEFAULT 'received';
