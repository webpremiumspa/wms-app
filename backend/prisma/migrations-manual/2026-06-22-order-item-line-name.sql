-- Agrega line_name a order_items para capturar el nombre completo del
-- line_item de WC, que incluye la variante del producto comprado
-- (ej. "Heno Oxbow - 425Gr Banana"). Si la columna queda NULL, la UI
-- cae al productMeta.name (producto maestro).

ALTER TABLE order_items
  ADD COLUMN line_name VARCHAR(255) NULL;
