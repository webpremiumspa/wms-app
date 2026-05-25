# Setup WordPress / WooCommerce para WMS Chimuelo

Estos pasos los aplica el equipo del WordPress (`dev.chimuelo.cl` para staging, después en producción). El backend del WMS no toca nada en WP por sí mismo.

## 1. Instalar plugin JWT

1. En `wp-admin → Plugins → Añadir nuevo`, buscar **"JWT Authentication for WP REST API"** (de Useful Team / Tmeister).
2. Activar.
3. Editar `wp-config.php` y añadir, **antes** de `That's all, stop editing!`:

   ```php
   define('JWT_AUTH_SECRET_KEY', 'PEGAR_UN_SECRETO_LARGO_Y_ALEATORIO');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```

   Generar el secret con `openssl rand -hex 64` o desde https://api.wordpress.org/secret-key/1.1/salt/.

4. Editar `.htaccess` de WP y añadir, dentro del bloque `<IfModule mod_rewrite.c>`:

   ```apache
   RewriteEngine on
   RewriteCond %{HTTP:Authorization} ^(.*)
   RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
   ```

5. Verificar:
   ```
   curl -X POST https://dev.chimuelo.cl/wp-json/jwt-auth/v1/token \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"..."}'
   ```
   Debe devolver `{ "token": "...", ... }`.

6. El mismo string del paso 3 se copia en `backend/.env` como `WP_JWT_SECRET`.

## 2. Rol y capabilities WMS

En un **mu-plugin** (recomendado) o en `functions.php` del tema hijo:

```php
<?php
// wp-content/mu-plugins/wms-roles.php
add_action('init', function () {
    if (! get_role('wms_operator')) {
        add_role('wms_operator', 'WMS Operario', [
            'read' => true,
        ]);
    }

    $caps = [
        'wms_pick_b1',
        'wms_pack_b1',
        'wms_pick_b2',
        'wms_load',
        'wms_deliver',
        'wms_supervise',
    ];

    // Damos las caps al admin para pruebas; en producción se asignan
    // por usuario individual desde el editor de roles.
    $admin = get_role('administrator');
    foreach ($caps as $cap) {
        $admin->add_cap($cap);
    }
}, 20);
```

Para gestionar capabilities por usuario sin código, instalar **"User Role Editor"** y marcar las caps `wms_*` en cada operario.

## 3. Meta box "Bodega" en producto WooCommerce

En el mismo mu-plugin:

```php
<?php
// wp-content/mu-plugins/wms-product-warehouse.php
add_action('woocommerce_product_options_inventory_product_data', function () {
    woocommerce_wp_select([
        'id'      => '_wms_bodega',
        'label'   => 'Bodega WMS',
        'options' => [
            ''   => '— sin asignar —',
            'B1' => 'Bodega 1',
            'B2' => 'Bodega 2',
        ],
        'desc_tip' => true,
        'description' => 'Bodega física donde se hace el picking de este SKU.',
    ]);
});

add_action('woocommerce_process_product_meta', function ($post_id) {
    $val = isset($_POST['_wms_bodega']) ? sanitize_text_field($_POST['_wms_bodega']) : '';
    if (in_array($val, ['B1', 'B2'], true)) {
        update_post_meta($post_id, '_wms_bodega', $val);
    } else {
        delete_post_meta($post_id, '_wms_bodega');
    }
});
```

Esto añade un selector en `wp-admin → Productos → editar → pestaña Inventario` con valores `B1`/`B2` que se guardan en el meta `_wms_bodega`.

## 4. Webhook WC → WMS

1. `wp-admin → WooCommerce → Configuración → Avanzado → Webhooks → Añadir webhook`.
2. Configurar:
   - **Nombre:** WMS Sync Orders
   - **Estado:** Activo
   - **Tema:** `Order updated`
   - **URL de entrega:** `https://wms.chimuelo.cl/api/hooks/wc/order`
   - **Secret:** un string largo aleatorio (copiar a `backend/.env` como `WC_WEBHOOK_SECRET`)
   - **Versión API:** v3
3. Guardar y testear con el botón "Entregar ahora" sobre un pedido existente.

## 5. Credenciales REST API para el WMS

1. `wp-admin → WooCommerce → Configuración → Avanzado → REST API → Añadir clave`.
2. **Descripción:** `WMS backend`
3. **Usuario:** un usuario admin (puede ser un service account)
4. **Permisos:** `Lectura/Escritura` (el WMS no escribe pedidos, pero podríamos necesitarlo a futuro)
5. Generar y copiar Consumer key / Consumer secret a `backend/.env` (`WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET`).

## 6. Confirmar metas del plugin de ruteo propio

Verificar en el código del plugin propio los nombres exactos:

- `_wdg_route` — confirmado por el usuario.
- `_wdg_stop_position` — **pendiente de confirmar el slug exacto**. Si el plugin lo guarda con otro nombre, actualizarlo en `backend/.env` (`META_ORDER_STOP_POSITION`).

## 7. Crear usuario operativo de prueba

1. `wp-admin → Usuarios → Añadir nuevo`.
2. Rol: `WMS Operario`.
3. Con User Role Editor, marcar al menos `wms_pack_b1` para probar el ciclo completo.
4. Probar login en `https://wms.chimuelo.cl` (o `http://localhost:5173` en dev).
