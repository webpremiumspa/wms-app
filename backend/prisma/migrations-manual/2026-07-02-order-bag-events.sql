-- Multi-bulto: registrar cada bulto clasificado / cargado por separado.
--
-- Contexto: hasta v0.22.0 la clasificación y la carga de un pedido de N
-- bultos se hacía en un solo scan (N checkboxes en la misma vista). En la
-- práctica, las bolsas y las cajas viven en zonas distintas del depósito y
-- el operador no puede tenerlas todas a la vista al mismo tiempo. Además
-- iba encontrando los bultos "por casualidad" al ir escaneando otros
-- pedidos, sin garantía de que llegara a los N.
--
-- Con esta tabla, cada scan de un bulto registra UN evento. El pedido pasa
-- a status='classified' / 'loaded' solo cuando la cantidad de eventos
-- registrados para ese evento es igual a bagsExpected. Así ningún bulto
-- queda "olvidado" en el depósito.
--
-- UNIQUE (order_id, bag_number, event) hace que registrar el mismo bulto
-- dos veces sea idempotente sin lógica extra en el backend.

CREATE TABLE order_bag_events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  bag_number  INT NOT NULL,
  event       VARCHAR(20) NOT NULL,
  actor_id    INT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  CONSTRAINT uq_order_bag_event UNIQUE (order_id, bag_number, event),
  INDEX ix_order (order_id),

  CONSTRAINT fk_bag_event_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_bag_event_actor
    FOREIGN KEY (actor_id) REFERENCES users_meta(wp_user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
