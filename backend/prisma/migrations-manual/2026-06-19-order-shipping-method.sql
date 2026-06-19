-- Agrega shipping_method a orders. Se llena en cada sync desde
-- WC shipping_lines[0].method_title (ej. "Starken", "Retiro en tienda").
-- Sirve para mostrar el método de envío en todas las vistas de pedido.

ALTER TABLE orders
  ADD COLUMN shipping_method VARCHAR(200) NULL;
