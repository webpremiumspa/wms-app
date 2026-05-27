-- Migración: Secuencias agnósticas de bodega
-- Fecha: 2026-05-26
--
-- Cambios en `sequences`:
--   * AGREGA b1_closed_at DATETIME(3) NULL
--   * AGREGA b2_closed_at DATETIME(3) NULL
--   * BACKFILL: en secuencias ya cerradas, copia closed_at al flujo
--     correspondiente según warehouse antigua.
--   * CAMBIA default de `mode` de 'by_sku' a 'by_order'.
--   * ELIMINA columna `warehouse` (sequences ahora son agnósticas).
--
-- IMPORTANTE: ejecutar ANTES de `prisma db push` (porque db push borraría la
-- columna warehouse sin backfill). Una vez aplicado, db push reflejará el
-- nuevo schema sin sorpresas.

ALTER TABLE sequences
  ADD COLUMN b1_closed_at DATETIME(3) NULL,
  ADD COLUMN b2_closed_at DATETIME(3) NULL;

-- Secuencias B1 cerradas: el cierre antiguo correspondía al packing B1.
UPDATE sequences
  SET b1_closed_at = closed_at
  WHERE warehouse = 'B1' AND status = 'closed' AND closed_at IS NOT NULL;

-- Secuencias B2 cerradas (caso legacy, raro): el cierre correspondía al picking B2.
UPDATE sequences
  SET b2_closed_at = closed_at
  WHERE warehouse = 'B2' AND status = 'closed' AND closed_at IS NOT NULL;

-- Cambiar default
ALTER TABLE sequences MODIFY COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'by_order';

-- Eliminar columna warehouse
ALTER TABLE sequences DROP COLUMN warehouse;
