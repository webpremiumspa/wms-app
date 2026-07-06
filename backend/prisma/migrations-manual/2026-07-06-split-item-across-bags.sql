-- Permitir que un item de pedido con qty > 1 se divida entre distintos
-- bultos (v0.24.2). En v0.24.0 el UNIQUE por order_item_id forzaba "un item
-- entero a un solo bulto". La operacion tiene casos donde un mismo producto
-- (ej. 2 sacos) se pone en 2 bolsas distintas por peso.
--
-- Cambios:
--   1. DROP INDEX uq_order_item — un item puede tener varias filas ahora.
--   2. ADD COLUMN qty — cuantas unidades de este item van en este bulto.
--      Default 1 preserva los planes ya guardados con qty=1 implicito.
--   3. NEW UNIQUE (order_item_id, bag_number) — un item aparece a lo sumo
--      una vez por bulto. Si el item va en 2 bultos, son 2 filas con
--      bag_number distintos.
--
-- Retrocompat: los planes viejos siguen sirviendo. Cada assignment queda
-- con qty=1 (item entero a un bulto). Si el picker necesita dividir, borra
-- el plan y arma uno nuevo.

ALTER TABLE order_item_bag_assignment
  DROP INDEX uq_order_item,
  ADD COLUMN qty INT NOT NULL DEFAULT 1 AFTER bag_number,
  ADD CONSTRAINT uq_order_item_bag UNIQUE (order_item_id, bag_number);
