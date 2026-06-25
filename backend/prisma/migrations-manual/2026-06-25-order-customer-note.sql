-- Agrega customer_note al pedido. Es la nota que el cliente dejó en el
-- checkout de WooCommerce (campo customer_note de WC). Se muestra en la
-- UI cuando se abre el pedido, para que el picker/empaquetador / repartidor
-- vea instrucciones especiales (ej. "tocar timbre 2", "casa amarilla").

ALTER TABLE orders
  ADD COLUMN customer_note TEXT NULL;
