-- Estado WC del pedido, refrescado por webhook order.updated.
-- Es independiente del `status` interno del WMS (received → loaded → delivered)
-- y refleja el slug WC tal cual ("en-preparacion", "en-ruta-pendiente",
-- "en-ruta-express-y", "completed", "cancelled", etc.). Sirve para mostrar
-- un chip en la lista de pendientes y en el detalle de secuencia que cambie
-- en tiempo real cuando el supervisor toca el pedido en WC.

ALTER TABLE orders
  ADD COLUMN wc_status VARCHAR(60) NULL AFTER status,
  ADD COLUMN wc_status_updated_at DATETIME(3) NULL AFTER wc_status;
