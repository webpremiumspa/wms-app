# Arquitectura — WMS Chimuelo

## Visión general

```
[ navegador móvil ]                 [ cPanel ]                          [ WordPress + WC ]
        │                              │                                       │
        │  HTTPS  ──>  wms.chimuelo.cl │  (Node.js app)                        │
        │              ┌──────────────┴────────────────┐                       │
        │              │  Express + Prisma             │ ──── HTTPS ──>  /wp-json/jwt-auth/v1/token
        │              │  - /api/auth (JWT vía WP)     │ ──── HTTPS ──>  /wp-json/wp/v2/users/me
        │              │  - /api/orders /sequences ... │ ──── HTTPS ──>  /wp-json/wc/v3/orders
        │              │  - /api/hooks/wc/order        │ <─── HMAC ───  webhook order.updated
        │              └──────────────┬────────────────┘                       │
        │                             │                                       │
[ React SPA + PWA ]                   │  MySQL local cPanel                    │
   (build estático)                   └──> wms_chimuelo (Prisma)               │
```

## Roles operativos y capabilities

Un único rol WP `wms_operator`. Las capabilities controlan qué pantallas y endpoints puede usar:

| Capability       | Descripción                                       |
|------------------|---------------------------------------------------|
| `wms_pick_b1`    | Picker en Bodega 1                                |
| `wms_pack_b1`    | Packer en Bodega 1 (también genera secuencias)    |
| `wms_pick_b2`    | Picker en Bodega 2                                |
| `wms_load`       | Operador de carga (clasificación QR + carga)      |
| `wms_deliver`    | Repartidor (vista de entrega + alerta B2)         |
| `wms_supervise`  | Supervisor (dashboard + sincronización manual)    |

Un usuario puede tener varias capabilities — el PDF lo contempla en la pantalla 1.

## Flujo de autenticación

1. Frontend `POST /api/auth/login` con `{ username, password }`.
2. Backend reenvía al plugin: `POST {WP}/wp-json/jwt-auth/v1/token`.
3. WP devuelve `{ token, user_email, ... }`.
4. Backend llama `GET /wp-json/wp/v2/users/me?context=edit` con ese token y obtiene capabilities completas.
5. Backend upserta `users_meta` localmente (solo capabilities con prefijo `wms_`).
6. Backend responde al frontend `{ token, user }`.
7. Frontend guarda token en `localStorage` y lo manda como `Authorization: Bearer ...` en cada request.
8. En cada request al backend, el middleware `requireAuth` valida el JWT localmente con `WP_JWT_SECRET` (HS256) sin tocar WP.

## Sincronización con WooCommerce

**Webhook (preferido).** WP envía `order.updated` a `POST /api/hooks/wc/order` con firma HMAC en `x-wc-webhook-signature`. El backend valida la firma con `WC_WEBHOOK_SECRET` y upserta el pedido.

**Manual.** Botón "Sincronizar ahora" en el dashboard del supervisor llama a un endpoint que hace pull desde la WC REST API para el día.

**Stock.** El WMS **no** descuenta stock en WC. Lo lee únicamente para la validación previa al picking (optimización #12 del PDF).

## Modelo de datos resumido

- `users_meta` — espejo de usuario WP con capabilities WMS y `lastLoginAt`.
- `products_meta` — espejo de SKU con campo `warehouse` (B1/B2) y thumbnail.
- `orders` — pedido con `status` WMS, `route`, `stopPosition`, `hasB2Pending`, packer, timestamps por etapa.
- `order_items` — items con su bodega calculada y timestamps de picked/packed.
- `sequences` + `sequence_orders` — agrupaciones de picking para Bodega 1.
- `events` — log para trazabilidad (PDF optimización #11).

Ver [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) para el detalle.

## Mapeo pantallas → endpoints

| PDF # | Pantalla                  | Endpoint principal                                     |
|-------|---------------------------|--------------------------------------------------------|
| 1     | Login                     | `POST /api/auth/login`                                 |
| 2     | Home                      | `GET /api/auth/me`                                     |
| 3     | Generar secuencia         | `GET /api/orders/pending` + `POST /api/sequences`      |
| 4     | Reporte de picking        | `GET /api/sequences/:id/picking-report`                |
| 5     | Selección pedido packing  | `GET /api/sequences/:id/pending-packing`               |
| 6     | Packing individual        | `POST /api/orders/:id/pack` + `GET /api/orders/:id/albaran.pdf` |
| 7     | Cierre de secuencia       | `POST /api/sequences/:id/close`                        |
| 8     | Picking Bodega 2          | `GET /api/sequences/b2/today`                          |
| 9     | Clasificación / carga     | `POST /api/dispatch/scan` + `POST /api/dispatch/:id/loaded` |
| 10    | Detalle de entrega        | `GET /api/dispatch/:id/delivery-view`                  |
| 11    | Dashboard supervisión     | `GET /api/dashboard/supervisor`                        |

## PWA

- Service worker generado por `vite-plugin-pwa` con estrategia `NetworkOnly` para `/api/*` (no cachear datos críticos).
- Cacheo de assets estáticos para arranque rápido en móvil.
- WiFi confiable en bodegas → no implementamos cola offline. Si en el futuro se necesita, se añade con Workbox Background Sync.
