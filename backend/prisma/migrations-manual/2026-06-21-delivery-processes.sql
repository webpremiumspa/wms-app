-- Fase B foundation: agrega entidad DeliveryProcess que agrupa secuencias
-- de un turno (matutino/vespertino). Cada secuencia debe pertenecer a un
-- proceso. Solo puede haber 1 proceso abierto a la vez (enforced en código).
--
-- IMPORTANTE: este script asume que los datos de prueba fueron wipeados
-- previamente (ver wipe-test-data.sql). Si hay secuencias existentes, el
-- ALTER TABLE va a fallar por la nueva columna NOT NULL sin default.

-- 1. Wipe de datos previo. Usamos DELETE en lugar de TRUNCATE porque las
--    tablas tienen FKs (TRUNCATE falla con cascade). El orden importa: hijos
--    primero. SET FOREIGN_KEY_CHECKS no funciona desde phpMyAdmin si tiene
--    el toggle "Habilitar revisión FK" prendido.
DELETE FROM events;
DELETE FROM sequence_orders;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM sequences;

-- Resetear AUTO_INCREMENT a 1 para empezar fresco.
ALTER TABLE events AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE sequences AUTO_INCREMENT = 1;

-- 2. Nueva tabla delivery_processes.
CREATE TABLE IF NOT EXISTS delivery_processes (
  id              INT NOT NULL AUTO_INCREMENT,
  name            VARCHAR(200) NOT NULL,
  scheduled_at    DATETIME(3) NULL,
  created_by_id   INT NOT NULL,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  closed_at       DATETIME(3) NULL,
  status          ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  PRIMARY KEY (id),
  INDEX idx_delivery_processes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Agregar process_id a sequences (NOT NULL, sin default).
--    Como secuencias está vacía después del wipe, el ALTER no falla.
ALTER TABLE sequences
  ADD COLUMN process_id INT NOT NULL,
  ADD INDEX idx_sequences_process (process_id),
  ADD CONSTRAINT fk_sequences_process
    FOREIGN KEY (process_id) REFERENCES delivery_processes(id);
