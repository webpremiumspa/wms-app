
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserMetaScalarFieldEnum = {
  wpUserId: 'wpUserId',
  username: 'username',
  displayName: 'displayName',
  email: 'email',
  capabilities: 'capabilities',
  active: 'active',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductMetaScalarFieldEnum = {
  wpProductId: 'wpProductId',
  sku: 'sku',
  name: 'name',
  warehouse: 'warehouse',
  thumbnailUrl: 'thumbnailUrl',
  syncedAt: 'syncedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  wpOrderId: 'wpOrderId',
  number: 'number',
  status: 'status',
  wcStatus: 'wcStatus',
  wcStatusUpdatedAt: 'wcStatusUpdatedAt',
  deliveryStatus: 'deliveryStatus',
  deliveryStatusUpdatedAt: 'deliveryStatusUpdatedAt',
  deliveryMeta: 'deliveryMeta',
  route: 'route',
  stopPosition: 'stopPosition',
  customerName: 'customerName',
  customerAddress: 'customerAddress',
  customerAddress2: 'customerAddress2',
  customerCity: 'customerCity',
  customerPhone: 'customerPhone',
  customerNote: 'customerNote',
  shippingMethod: 'shippingMethod',
  driverId: 'driverId',
  driverName: 'driverName',
  vehicle: 'vehicle',
  patente: 'patente',
  hasB2Pending: 'hasB2Pending',
  bagsExpected: 'bagsExpected',
  allowPartialDelivery: 'allowPartialDelivery',
  partialDeliveryNote: 'partialDeliveryNote',
  pickedById: 'pickedById',
  claimedAt: 'claimedAt',
  packedById: 'packedById',
  packedAt: 'packedAt',
  b2ClosedById: 'b2ClosedById',
  b2ClosedAt: 'b2ClosedAt',
  classifiedAt: 'classifiedAt',
  loadedAt: 'loadedAt',
  deliveredAt: 'deliveredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderBagEventScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  bagNumber: 'bagNumber',
  event: 'event',
  actorId: 'actorId',
  createdAt: 'createdAt'
};

exports.Prisma.OrderItemBagAssignmentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  orderItemId: 'orderItemId',
  bagNumber: 'bagNumber',
  qty: 'qty',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  qty: 'qty',
  warehouse: 'warehouse',
  lineName: 'lineName',
  pickedAt: 'pickedAt',
  packedAt: 'packedAt'
};

exports.Prisma.DeliveryProcessScalarFieldEnum = {
  id: 'id',
  name: 'name',
  scheduledAt: 'scheduledAt',
  createdById: 'createdById',
  createdAt: 'createdAt',
  closedAt: 'closedAt',
  status: 'status'
};

exports.Prisma.SequenceScalarFieldEnum = {
  id: 'id',
  processId: 'processId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  closedAt: 'closedAt',
  b1ClosedAt: 'b1ClosedAt',
  b2ClosedAt: 'b2ClosedAt',
  expectedBags: 'expectedBags',
  actualBags: 'actualBags',
  status: 'status'
};

exports.Prisma.SequenceOrderScalarFieldEnum = {
  sequenceId: 'sequenceId',
  orderId: 'orderId'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  type: 'type',
  actorId: 'actorId',
  orderId: 'orderId',
  payload: 'payload',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Warehouse = exports.$Enums.Warehouse = {
  B1: 'B1',
  B2: 'B2'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  received: 'received',
  sequenced: 'sequenced',
  picked: 'picked',
  packed: 'packed',
  classified: 'classified',
  loaded: 'loaded',
  delivered: 'delivered',
  blocked: 'blocked'
};

exports.ProcessStatus = exports.$Enums.ProcessStatus = {
  open: 'open',
  closed: 'closed'
};

exports.SequenceStatus = exports.$Enums.SequenceStatus = {
  open: 'open',
  closed: 'closed'
};

exports.Prisma.ModelName = {
  UserMeta: 'UserMeta',
  ProductMeta: 'ProductMeta',
  Order: 'Order',
  OrderBagEvent: 'OrderBagEvent',
  OrderItemBagAssignment: 'OrderItemBagAssignment',
  OrderItem: 'OrderItem',
  DeliveryProcess: 'DeliveryProcess',
  Sequence: 'Sequence',
  SequenceOrder: 'SequenceOrder',
  Event: 'Event'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\dsalg\\OneDrive - Webpremium\\Proyectos\\Chimuelo\\wms app\\backend\\generated\\client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "rhel-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "rhel-openssl-1.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\dsalg\\OneDrive - Webpremium\\Proyectos\\Chimuelo\\wms app\\backend\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider      = \"prisma-client-js\"\n  output        = \"../generated/client\"\n  binaryTargets = [\"native\", \"rhel-openssl-3.0.x\", \"rhel-openssl-1.0.x\", \"debian-openssl-3.0.x\", \"debian-openssl-1.1.x\"]\n}\n\ndatasource db {\n  provider = \"mysql\"\n  url      = env(\"DATABASE_URL\")\n}\n\n// Espejo ligero del usuario WP. Las credenciales viven en WordPress;\n// aquí guardamos solo lo necesario para mostrar el operario en la UI\n// y resolver capabilities sin pegarle a WP en cada request.\nmodel UserMeta {\n  wpUserId     Int       @id @map(\"wp_user_id\")\n  username     String    @db.VarChar(120)\n  displayName  String    @map(\"display_name\") @db.VarChar(180)\n  email        String?   @db.VarChar(180)\n  capabilities Json\n  active       Boolean   @default(true)\n  lastLoginAt  DateTime? @map(\"last_login_at\")\n  createdAt    DateTime  @default(now()) @map(\"created_at\")\n  updatedAt    DateTime  @updatedAt @map(\"updated_at\")\n\n  processesCreated DeliveryProcess[] @relation(\"ProcessCreator\")\n  sequencesCreated Sequence[]        @relation(\"SequenceCreator\")\n  packedOrders     Order[]           @relation(\"OrderPacker\")\n  pickedOrders     Order[]           @relation(\"OrderPicker\")\n  b2ClosedOrders   Order[]           @relation(\"OrderB2Closer\")\n  events           Event[]\n  bagEvents        OrderBagEvent[]   @relation(\"BagEventActor\")\n\n  @@map(\"users_meta\")\n}\n\n// Espejo del producto WC. Lo poblamos por sync (webhook product.updated\n// o pull on-demand). Guarda la bodega para evitar consultar WC en cada picking.\nmodel ProductMeta {\n  wpProductId  Int        @id @map(\"wp_product_id\")\n  sku          String?    @db.VarChar(120)\n  name         String     @db.VarChar(255)\n  warehouse    Warehouse?\n  thumbnailUrl String?    @map(\"thumbnail_url\") @db.VarChar(500)\n  syncedAt     DateTime   @default(now()) @map(\"synced_at\")\n\n  orderItems OrderItem[]\n\n  @@index([sku])\n  @@index([warehouse])\n  @@map(\"products_meta\")\n}\n\nmodel Order {\n  id                      Int         @id @default(autoincrement())\n  wpOrderId               Int         @unique @map(\"wp_order_id\")\n  number                  String      @db.VarChar(64)\n  status                  OrderStatus @default(received)\n  // Estado WC tal cual (slug). Independiente de `status` interno del WMS:\n  // refleja lo que se ve en el admin de WC (\"en-preparacion\",\n  // \"en-ruta-pendiente\", \"en-ruta-express-y\", \"completed\", \"cancelled\"...).\n  // Se refresca por webhook order.updated. Útil como chip de contexto en la\n  // UI: si un pedido cambió de estado en WC, el supervisor lo ve sin tener\n  // que pegarle a sync manual.\n  wcStatus                String?     @map(\"wc_status\") @db.VarChar(60)\n  wcStatusUpdatedAt       DateTime?   @map(\"wc_status_updated_at\")\n  // v0.25.9: estado de entrega derivado de metas WDG del sistema de rutas.\n  //   NULL         → pedido no salido a ruta / desconocido\n  //   'delivered'  → _wdg_delivered='1'\n  //   'partial'    → _wdg_partial='1'\n  //   'returned'   → WMS estaba en 'loaded' + WC volvió a 'en-preparacion' sin metas\n  // deliveryMeta guarda { by, date } o { returnedAt } segun caso.\n  deliveryStatus          String?     @map(\"delivery_status\") @db.VarChar(20)\n  deliveryStatusUpdatedAt DateTime?   @map(\"delivery_status_updated_at\")\n  deliveryMeta            Json?       @map(\"delivery_meta\")\n  route                   String?     @db.VarChar(64)\n  stopPosition            Int?        @map(\"stop_position\")\n  customerName            String?     @map(\"customer_name\") @db.VarChar(200)\n  customerAddress         String?     @map(\"customer_address\") @db.VarChar(500)\n  customerAddress2        String?     @map(\"customer_address2\") @db.VarChar(255)\n  customerCity            String?     @map(\"customer_city\") @db.VarChar(120)\n  customerPhone           String?     @map(\"customer_phone\") @db.VarChar(40)\n  customerNote            String?     @map(\"customer_note\") @db.Text\n  shippingMethod          String?     @map(\"shipping_method\") @db.VarChar(200)\n  driverId                Int?        @map(\"driver_id\")\n  driverName              String?     @map(\"driver_name\") @db.VarChar(200)\n  vehicle                 String?     @db.VarChar(200)\n  patente                 String?     @db.VarChar(50)\n  hasB2Pending            Boolean     @default(false) @map(\"has_b2_pending\")\n  bagsExpected            Int         @default(1) @map(\"bags_expected\")\n  // Entrega parcial aprobada: si el cliente acepta recibir el pedido aunque\n  // falten items B2 (sin stock), un operador con cap pack_b1 puede autorizar.\n  // Cuando es true, el chequeo de bloqueo en dispatch se omite y el albarán\n  // muestra qué items NO van en esta entrega.\n  allowPartialDelivery    Boolean     @default(false) @map(\"allow_partial_delivery\")\n  partialDeliveryNote     String?     @map(\"partial_delivery_note\") @db.VarChar(500)\n  // Claim del picker: se setea al escanear el QR del albarán para empezar\n  // a preparar el pedido. Bloquea a otros pickers de tomar el mismo pedido.\n  pickedById              Int?        @map(\"picked_by_id\")\n  claimedAt               DateTime?   @map(\"claimed_at\")\n  packedById              Int?        @map(\"packed_by_id\")\n  packedAt                DateTime?   @map(\"packed_at\")\n  // Cierre B2 por pedido: el picker B2 escanea el QR del albarán, marca los\n  // items B2 que pone en la sub-bolsa del pedido y cierra. Cuando todos los\n  // pedidos con B2 de una secuencia tienen b2ClosedAt → la secuencia\n  // auto-cierra su flujo B2.\n  b2ClosedById            Int?        @map(\"b2_closed_by_id\")\n  b2ClosedAt              DateTime?   @map(\"b2_closed_at\")\n  classifiedAt            DateTime?   @map(\"classified_at\")\n  loadedAt                DateTime?   @map(\"loaded_at\")\n  deliveredAt             DateTime?   @map(\"delivered_at\")\n  createdAt               DateTime    @default(now()) @map(\"created_at\")\n  updatedAt               DateTime    @updatedAt @map(\"updated_at\")\n\n  packedBy       UserMeta?                @relation(\"OrderPacker\", fields: [packedById], references: [wpUserId])\n  pickedBy       UserMeta?                @relation(\"OrderPicker\", fields: [pickedById], references: [wpUserId])\n  b2ClosedBy     UserMeta?                @relation(\"OrderB2Closer\", fields: [b2ClosedById], references: [wpUserId])\n  items          OrderItem[]\n  sequenceLinks  SequenceOrder[]\n  events         Event[]\n  bagEvents      OrderBagEvent[]\n  bagAssignments OrderItemBagAssignment[]\n\n  @@index([status])\n  @@index([route])\n  @@map(\"orders\")\n}\n\n// Registro por bulto para clasificación y carga. Un pedido de N bultos genera\n// hasta N eventos por cada `event` ('classified' | 'loaded'). El pedido pasa\n// a status='classified'/'loaded' solo cuando se registraron los N. Permite\n// que los bultos se escaneen en momentos distintos y desde ubicaciones\n// distintas del depósito sin perder la garantía de completitud.\nmodel OrderBagEvent {\n  id        Int      @id @default(autoincrement())\n  orderId   Int      @map(\"order_id\")\n  bagNumber Int      @map(\"bag_number\")\n  event     String   @db.VarChar(20) // 'classified' | 'loaded'\n  actorId   Int?     @map(\"actor_id\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  order Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  actor UserMeta? @relation(\"BagEventActor\", fields: [actorId], references: [wpUserId])\n\n  @@unique([orderId, bagNumber, event], name: \"uq_order_bag_event\")\n  @@index([orderId])\n  @@map(\"order_bag_events\")\n}\n\n// Asignación de un item de pedido a un bulto especifico. v0.24.0: plan de\n// distribución multi-bulto que declara qué items van en qué bulto antes\n// de imprimir. v0.24.2: un item con qty>1 puede dividirse entre bultos\n// (varias filas por orderItemId, cada una con su qty). La suma de qty por\n// item debe igualar la qty total del item. Ver services/pack-plan.js.\nmodel OrderItemBagAssignment {\n  id          Int      @id @default(autoincrement())\n  orderId     Int      @map(\"order_id\")\n  // 1:N con OrderItem (un item puede tener hasta N filas, una por bulto\n  // en el que aparece). El uniqueness real vive en @@unique más abajo.\n  orderItemId Int      @map(\"order_item_id\")\n  bagNumber   Int      @map(\"bag_number\")\n  // Cantidad de unidades del item que van en este bulto. Debe ser >0 y la\n  // suma por item.orderItemId debe = item.qty.\n  qty         Int\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  order     Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  orderItem OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)\n\n  // Un item aparece a lo sumo una vez por bulto. Si va en 2 bultos son 2\n  // filas con bag_number distintos.\n  @@unique([orderItemId, bagNumber], name: \"uq_order_item_bag\")\n  @@index([orderId, bagNumber], name: \"ix_order_bag\")\n  @@map(\"order_item_bag_assignment\")\n}\n\nmodel OrderItem {\n  id        Int       @id @default(autoincrement())\n  orderId   Int       @map(\"order_id\")\n  productId Int       @map(\"product_id\")\n  qty       Int\n  warehouse Warehouse\n  // Nombre tal como vino del line_item de WC. Incluye la variante (ej.\n  // \"Heno Oxbow - 425Gr Banana\"). Si difiere de productMeta.name, la UI\n  // lo muestra para que el picker vea el sabor/color/tamaño exacto.\n  lineName  String?   @map(\"line_name\") @db.VarChar(255)\n  pickedAt  DateTime? @map(\"picked_at\")\n  packedAt  DateTime? @map(\"packed_at\")\n\n  order          Order                    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  product        ProductMeta              @relation(fields: [productId], references: [wpProductId])\n  bagAssignments OrderItemBagAssignment[]\n\n  @@index([orderId])\n  @@index([productId])\n  @@map(\"order_items\")\n}\n\n// Secuencia de picking: agrupa N pedidos. Es agnóstica de bodega — los items\n// B1 los pickea el equipo de Bodega 1 (y se empacan en bolsa) y los items B2\n// los pickea el equipo de Bodega 2 (a granel para el día). Cada flujo cierra\n// por separado (b1ClosedAt / b2ClosedAt); status global pasa a 'closed' cuando\n// ambos están cerrados.\n//\n// Modelo simplificado: solo existe el flujo \"por pedido\" (cada picker escanea\n// el QR del albarán impreso y empaca un pedido completo). El modo \"por SKU\"\n// fue eliminado del modelo (era poco usado y agregaba complejidad).\n// Proceso de preparación y carga. Es el contenedor del trabajo de un turno\n// (matutino o vespertino). Agrupa N secuencias y se cierra automáticamente\n// cuando todos sus pedidos están cargados al vehículo. Restricción de negocio:\n// solo puede haber 1 proceso abierto a la vez.\nmodel DeliveryProcess {\n  id          Int           @id @default(autoincrement())\n  name        String        @db.VarChar(200)\n  scheduledAt DateTime?     @map(\"scheduled_at\")\n  createdById Int           @map(\"created_by_id\")\n  createdAt   DateTime      @default(now()) @map(\"created_at\")\n  closedAt    DateTime?     @map(\"closed_at\")\n  status      ProcessStatus @default(open)\n\n  createdBy UserMeta   @relation(\"ProcessCreator\", fields: [createdById], references: [wpUserId])\n  sequences Sequence[]\n\n  @@index([status])\n  @@map(\"delivery_processes\")\n}\n\nmodel Sequence {\n  id           Int            @id @default(autoincrement())\n  processId    Int            @map(\"process_id\")\n  createdById  Int            @map(\"created_by_id\")\n  createdAt    DateTime       @default(now()) @map(\"created_at\")\n  closedAt     DateTime?      @map(\"closed_at\")\n  b1ClosedAt   DateTime?      @map(\"b1_closed_at\")\n  b2ClosedAt   DateTime?      @map(\"b2_closed_at\")\n  expectedBags Int            @default(0) @map(\"expected_bags\")\n  actualBags   Int            @default(0) @map(\"actual_bags\")\n  status       SequenceStatus @default(open)\n\n  process   DeliveryProcess @relation(fields: [processId], references: [id])\n  createdBy UserMeta        @relation(\"SequenceCreator\", fields: [createdById], references: [wpUserId])\n  orders    SequenceOrder[]\n\n  @@index([processId])\n  @@map(\"sequences\")\n}\n\nmodel SequenceOrder {\n  sequenceId Int @map(\"sequence_id\")\n  orderId    Int @map(\"order_id\")\n\n  sequence Sequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)\n  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@id([sequenceId, orderId])\n  @@map(\"sequence_orders\")\n}\n\n// Log de eventos para trazabilidad (quién hizo qué sobre qué pedido).\nmodel Event {\n  id        Int      @id @default(autoincrement())\n  type      String   @db.VarChar(60)\n  actorId   Int?     @map(\"actor_id\")\n  orderId   Int?     @map(\"order_id\")\n  payload   Json?\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  actor UserMeta? @relation(fields: [actorId], references: [wpUserId])\n  // v0.25.15: onDelete SetNull para preservar audit trail. Antes con\n  // CASCADE se perdían todos los eventos si el pedido se borraba (caso\n  // real: sync bulk borró el pedido 1156275 y con él todo su timeline).\n  // Ahora si un pedido se borra, sus eventos sobreviven con order_id=NULL;\n  // se pueden reconstruir buscando por payload que mencione wpOrderId.\n  order Order?    @relation(fields: [orderId], references: [id], onDelete: SetNull)\n\n  @@index([type])\n  @@index([orderId])\n  @@map(\"events\")\n}\n\nenum Warehouse {\n  B1\n  B2\n}\n\nenum OrderStatus {\n  received // pedido sincronizado, aún no asignado a secuencia\n  sequenced // ya está en una secuencia abierta\n  picked // items recolectados\n  packed // bolsa armada\n  classified // QR escaneado en la mañana, ruta confirmada\n  loaded // subido a la camioneta\n  delivered // entregado (lo escribe el repartidor o el sistema externo)\n  blocked // sacado de secuencia por faltante (B1/B2) o cancelación\n}\n\nenum SequenceStatus {\n  open\n  closed\n}\n\nenum ProcessStatus {\n  open\n  closed\n}\n",
  "inlineSchemaHash": "3e2d8aad468dff24b705f2027c18cb454efa563c1c68c3a49c60cf7d62f98c6c",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "generated/client",
    "client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"UserMeta\":{\"dbName\":\"users_meta\",\"fields\":[{\"name\":\"wpUserId\",\"dbName\":\"wp_user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayName\",\"dbName\":\"display_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capabilities\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastLoginAt\",\"dbName\":\"last_login_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"processesCreated\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeliveryProcess\",\"relationName\":\"ProcessCreator\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sequencesCreated\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Sequence\",\"relationName\":\"SequenceCreator\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packedOrders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderPacker\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickedOrders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderPicker\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b2ClosedOrders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderB2Closer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"events\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Event\",\"relationName\":\"EventToUserMeta\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderBagEvent\",\"relationName\":\"BagEventActor\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProductMeta\":{\"dbName\":\"products_meta\",\"fields\":[{\"name\":\"wpProductId\",\"dbName\":\"wp_product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sku\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warehouse\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Warehouse\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnailUrl\",\"dbName\":\"thumbnail_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"syncedAt\",\"dbName\":\"synced_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItem\",\"relationName\":\"OrderItemToProductMeta\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Order\":{\"dbName\":\"orders\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wpOrderId\",\"dbName\":\"wp_order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"OrderStatus\",\"default\":\"received\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wcStatus\",\"dbName\":\"wc_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"wcStatusUpdatedAt\",\"dbName\":\"wc_status_updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryStatus\",\"dbName\":\"delivery_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryStatusUpdatedAt\",\"dbName\":\"delivery_status_updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveryMeta\",\"dbName\":\"delivery_meta\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"route\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stopPosition\",\"dbName\":\"stop_position\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerName\",\"dbName\":\"customer_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerAddress\",\"dbName\":\"customer_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerAddress2\",\"dbName\":\"customer_address2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerCity\",\"dbName\":\"customer_city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerPhone\",\"dbName\":\"customer_phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerNote\",\"dbName\":\"customer_note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shippingMethod\",\"dbName\":\"shipping_method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"driverId\",\"dbName\":\"driver_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"driverName\",\"dbName\":\"driver_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vehicle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"patente\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasB2Pending\",\"dbName\":\"has_b2_pending\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagsExpected\",\"dbName\":\"bags_expected\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"allowPartialDelivery\",\"dbName\":\"allow_partial_delivery\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"partialDeliveryNote\",\"dbName\":\"partial_delivery_note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickedById\",\"dbName\":\"picked_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"claimedAt\",\"dbName\":\"claimed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packedById\",\"dbName\":\"packed_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packedAt\",\"dbName\":\"packed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b2ClosedById\",\"dbName\":\"b2_closed_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b2ClosedAt\",\"dbName\":\"b2_closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"classifiedAt\",\"dbName\":\"classified_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loadedAt\",\"dbName\":\"loaded_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deliveredAt\",\"dbName\":\"delivered_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"packedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"OrderPacker\",\"relationFromFields\":[\"packedById\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"OrderPicker\",\"relationFromFields\":[\"pickedById\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b2ClosedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"OrderB2Closer\",\"relationFromFields\":[\"b2ClosedById\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItem\",\"relationName\":\"OrderToOrderItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sequenceLinks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SequenceOrder\",\"relationName\":\"OrderToSequenceOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"events\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Event\",\"relationName\":\"EventToOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderBagEvent\",\"relationName\":\"OrderToOrderBagEvent\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagAssignments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItemBagAssignment\",\"relationName\":\"OrderToOrderItemBagAssignment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OrderBagEvent\":{\"dbName\":\"order_bag_events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagNumber\",\"dbName\":\"bag_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"event\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToOrderBagEvent\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"BagEventActor\",\"relationFromFields\":[\"actorId\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"orderId\",\"bagNumber\",\"event\"]],\"uniqueIndexes\":[{\"name\":\"uq_order_bag_event\",\"fields\":[\"orderId\",\"bagNumber\",\"event\"]}],\"isGenerated\":false},\"OrderItemBagAssignment\":{\"dbName\":\"order_item_bag_assignment\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderItemId\",\"dbName\":\"order_item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagNumber\",\"dbName\":\"bag_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToOrderItemBagAssignment\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderItem\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItem\",\"relationName\":\"OrderItemToOrderItemBagAssignment\",\"relationFromFields\":[\"orderItemId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"orderItemId\",\"bagNumber\"]],\"uniqueIndexes\":[{\"name\":\"uq_order_item_bag\",\"fields\":[\"orderItemId\",\"bagNumber\"]}],\"isGenerated\":false},\"OrderItem\":{\"dbName\":\"order_items\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"productId\",\"dbName\":\"product_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warehouse\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Warehouse\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lineName\",\"dbName\":\"line_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickedAt\",\"dbName\":\"picked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"packedAt\",\"dbName\":\"packed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToOrderItem\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"product\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ProductMeta\",\"relationName\":\"OrderItemToProductMeta\",\"relationFromFields\":[\"productId\"],\"relationToFields\":[\"wpProductId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bagAssignments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OrderItemBagAssignment\",\"relationName\":\"OrderItemToOrderItemBagAssignment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DeliveryProcess\":{\"dbName\":\"delivery_processes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scheduledAt\",\"dbName\":\"scheduled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdById\",\"dbName\":\"created_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"closedAt\",\"dbName\":\"closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProcessStatus\",\"default\":\"open\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"ProcessCreator\",\"relationFromFields\":[\"createdById\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sequences\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Sequence\",\"relationName\":\"DeliveryProcessToSequence\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Sequence\":{\"dbName\":\"sequences\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processId\",\"dbName\":\"process_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdById\",\"dbName\":\"created_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"closedAt\",\"dbName\":\"closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b1ClosedAt\",\"dbName\":\"b1_closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"b2ClosedAt\",\"dbName\":\"b2_closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expectedBags\",\"dbName\":\"expected_bags\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actualBags\",\"dbName\":\"actual_bags\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SequenceStatus\",\"default\":\"open\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"process\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeliveryProcess\",\"relationName\":\"DeliveryProcessToSequence\",\"relationFromFields\":[\"processId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"SequenceCreator\",\"relationFromFields\":[\"createdById\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orders\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SequenceOrder\",\"relationName\":\"SequenceToSequenceOrder\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SequenceOrder\":{\"dbName\":\"sequence_orders\",\"fields\":[{\"name\":\"sequenceId\",\"dbName\":\"sequence_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sequence\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Sequence\",\"relationName\":\"SequenceToSequenceOrder\",\"relationFromFields\":[\"sequenceId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"OrderToSequenceOrder\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"sequenceId\",\"orderId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Event\":{\"dbName\":\"events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserMeta\",\"relationName\":\"EventToUserMeta\",\"relationFromFields\":[\"actorId\"],\"relationToFields\":[\"wpUserId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Order\",\"relationName\":\"EventToOrder\",\"relationFromFields\":[\"orderId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"Warehouse\":{\"values\":[{\"name\":\"B1\",\"dbName\":null},{\"name\":\"B2\",\"dbName\":null}],\"dbName\":null},\"OrderStatus\":{\"values\":[{\"name\":\"received\",\"dbName\":null},{\"name\":\"sequenced\",\"dbName\":null},{\"name\":\"picked\",\"dbName\":null},{\"name\":\"packed\",\"dbName\":null},{\"name\":\"classified\",\"dbName\":null},{\"name\":\"loaded\",\"dbName\":null},{\"name\":\"delivered\",\"dbName\":null},{\"name\":\"blocked\",\"dbName\":null}],\"dbName\":null},\"SequenceStatus\":{\"values\":[{\"name\":\"open\",\"dbName\":null},{\"name\":\"closed\",\"dbName\":null}],\"dbName\":null},\"ProcessStatus\":{\"values\":[{\"name\":\"open\",\"dbName\":null},{\"name\":\"closed\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "generated/client/query_engine-windows.dll.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-rhel-openssl-3.0.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-rhel-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-rhel-openssl-1.0.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-rhel-openssl-1.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-debian-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "generated/client/schema.prisma")
