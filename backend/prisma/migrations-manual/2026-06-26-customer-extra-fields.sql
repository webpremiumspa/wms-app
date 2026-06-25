-- Albarán enriquecido: separar dirección, depto, comuna y teléfono para
-- imprimirlos como campos etiquetados en el PDF.
--
-- Hasta ahora customer_address concatenaba todo lo que venía de WC; eso
-- imprimía un string ruidoso ("4398 Manuela Errázuriz PEDRO AGUIRRE CERDA
-- Santiago REGIÓN METROPOLITANA CL 8460431") difícil de leer en la calle.
-- A partir de este sync: customer_address = address_1 (calle + número),
-- los otros tres son columnas dedicadas y el sync los rellena por separado.

ALTER TABLE orders
  ADD COLUMN customer_address2 VARCHAR(255) NULL AFTER customer_address,
  ADD COLUMN customer_city     VARCHAR(120) NULL AFTER customer_address2,
  ADD COLUMN customer_phone    VARCHAR(40)  NULL AFTER customer_city;
