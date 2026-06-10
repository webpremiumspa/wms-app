-- Migración: Picker claim + eliminación del modo de picking
-- Fecha: 2026-06-05
--
-- Cambios:
--   * Order: AGREGA picked_by_id INT NULL (FK al usuario que escaneó el QR)
--   * Order: AGREGA claimed_at DATETIME(3) NULL (momento del claim)
--   * Sequence: ELIMINA columna mode (ya no se diferencia by_sku vs by_order)
--
-- IMPORTANTE: ejecutar ANTES del deploy.

ALTER TABLE orders
  ADD COLUMN picked_by_id INT NULL,
  ADD COLUMN claimed_at DATETIME(3) NULL;

-- No agregamos índice/FK explícito — Prisma maneja el join por wpUserId.

ALTER TABLE sequences DROP COLUMN mode;
