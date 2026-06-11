-- Migración: Picking B2 por pedido (idéntico al B1)
-- Fecha: 2026-06-11
--
-- Cambios:
--   * Order: AGREGA b2_closed_by_id INT NULL
--   * Order: AGREGA b2_closed_at DATETIME(3) NULL
--   * Backfill: para secuencias ya con b2_closed_at, marcamos todos sus
--     pedidos con b2_closed_at = sequence.b2_closed_at (preserva historial).
--
-- IMPORTANTE: ejecutar ANTES del deploy.

ALTER TABLE orders
  ADD COLUMN b2_closed_by_id INT NULL,
  ADD COLUMN b2_closed_at DATETIME(3) NULL;

-- Backfill: pedidos en secuencias con b2 ya cerrado heredan ese timestamp.
UPDATE orders o
  INNER JOIN sequence_orders so ON so.order_id = o.id
  INNER JOIN sequences s ON s.id = so.sequence_id
  SET o.b2_closed_at = s.b2_closed_at
  WHERE s.b2_closed_at IS NOT NULL
    AND o.b2_closed_at IS NULL;
