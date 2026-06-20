-- Agrega info de driver y vehículo asignados al pedido. Vienen de las metas
-- WC del plugin woo-delivery-groups:
--   _wdg_driver_id    → driver_id
--   _wdg_driver_name  → driver_name
--   _wdg_vehicle      → vehicle    (label tipo "PATENTE (Tipo)")
--   _wdg_patente      → patente
-- Se capturan en cada sync (syncOrder + updateOrderMetaFromWc).

ALTER TABLE orders
  ADD COLUMN driver_id INT NULL,
  ADD COLUMN driver_name VARCHAR(200) NULL,
  ADD COLUMN vehicle VARCHAR(200) NULL,
  ADD COLUMN patente VARCHAR(50) NULL;
