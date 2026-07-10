-- v0.25.9: estado de entrega del pedido derivado de metas WDG del sistema
-- de rutas externo. Cacheado en la BD para no consultar WC en cada listado.
--
-- Valores posibles en delivery_status:
--   NULL         → pedido no ha salido a ruta aun, o estado desconocido
--   'delivered'  → meta _wdg_delivered='1' presente
--   'partial'    → meta _wdg_partial='1' presente
--   'returned'   → sin metas WDG, WMS estaba en 'loaded' y WC volvio a
--                  'en-preparacion' (pedido reagendado tras devolucion)
--
-- delivery_meta guarda { by, date } o { returnedAt } segun el caso.
--
-- Ejecutar en phpMyAdmin ANTES del deploy de backend.

ALTER TABLE orders
  ADD COLUMN delivery_status VARCHAR(20) NULL AFTER wc_status_updated_at,
  ADD COLUMN delivery_status_updated_at DATETIME(3) NULL AFTER delivery_status,
  ADD COLUMN delivery_meta JSON NULL AFTER delivery_status_updated_at;
