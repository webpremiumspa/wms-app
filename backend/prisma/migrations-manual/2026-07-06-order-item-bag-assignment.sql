-- Multi-bulto por bulto en empaque: distribucion de items por bulto y cierre
-- individual por bulto (analogo al modelo de classify/loaded que ya existe
-- desde v0.23.0). Ver services/pack-plan.js.
--
-- Contexto operativo: en la practica varios pickers preparan distintos
-- bultos del mismo pedido en paralelo. El primer picker (o supervisor)
-- declara la distribucion de items -> N bultos, imprime N albaranes filtrados
-- (cada uno solo con los items de su bulto) y despues cada picker cierra
-- SU bulto por separado. Cuando se cierran los N bultos, el pedido pasa a
-- status='packed' automaticamente.
--
-- Retrocompat: single-bulto (bagsExpected=1) sigue funcionando con el
-- flujo actual POST /orders/:id/pack. Solo cuando N>1 se usa el pack plan.

CREATE TABLE order_item_bag_assignment (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  order_item_id INT NOT NULL,
  bag_number    INT NOT NULL,
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  -- Un item vive en un solo bulto (decision de negocio v0.24.0: no fraccionamos qty).
  -- El UNIQUE solo sobre order_item_id habilita relacion 1:1 en Prisma.
  CONSTRAINT uq_order_item UNIQUE (order_item_id),
  INDEX ix_order (order_id),
  INDEX ix_order_bag (order_id, bag_number),

  CONSTRAINT fk_bag_ass_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_bag_ass_item
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nota: el campo order_bag_events.event ahora tambien admite 'packed' (ademas
-- de 'classified' y 'loaded'). No requiere ALTER porque el campo es VARCHAR(20).
