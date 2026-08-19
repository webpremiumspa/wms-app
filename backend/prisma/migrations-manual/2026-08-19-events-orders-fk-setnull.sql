-- v0.25.15: cambiar la FK events.order_id → orders.id de CASCADE a SET NULL.
--
-- Motivo: cuando un pedido se borra (típicamente por el reset del sync bulk
-- sobre pedidos en status='received'), la FK CASCADE actual arrastra todos
-- sus eventos. Perdemos audit trail — imposible reconstruir el timeline del
-- pedido. Caso real: pedido 1156275 (id=17767) perdió todos sus eventos
-- cuando el sync bulk lo barrió tras estar en 'received' con chip 'revived'.
--
-- Con SET NULL, los eventos sobreviven con order_id=NULL. Se pueden
-- reconstruir buscando por payload que mencione el wpOrderId (los eventos
-- de tipo order.wc_synced, dispatch.*, order.packed, etc. suelen tener info
-- del pedido en el payload).
--
-- Pasos:
-- 1) Localizar el nombre exacto de la FK actual (puede tener prefijo Prisma).
-- 2) Dropearla.
-- 3) Recrearla con ON DELETE SET NULL.
--
-- Antes de ejecutar, correr para ver el nombre real:
--   SHOW CREATE TABLE events;
--
-- El nombre suele ser algo como events_order_id_fkey. Ajustar si es distinto.

-- Paso 1 + 2: dropear la FK vieja (nombre por default de Prisma).
ALTER TABLE events DROP FOREIGN KEY events_order_id_fkey;

-- Paso 3: recrear con SET NULL.
ALTER TABLE events
  ADD CONSTRAINT events_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE SET NULL ON UPDATE CASCADE;
