# Despliegue en cPanel vía Git

Esta guía cubre el despliegue del WMS en cPanel usando **Git Version Control**. El backend Node.js corre como app Passenger en `wms.chimuelo.cl/api` y el frontend (SPA + PWA) se sirve estático en la raíz del subdominio.

## Estructura final en el servidor

```
/home/USUARIO/
├── repos/wms-chimuelo/           ← Git clone (deploy source)
│   ├── .cpanel.yml               ← script que ejecuta el deploy
│   ├── backend/
│   ├── frontend/
│   └── docs/
└── wms.chimuelo.cl/              ← document root del subdominio
    ├── backend/                  ← Application root de la app Node
    │   ├── server.js
    │   ├── package.json
    │   ├── src/
    │   └── prisma/
    ├── index.html                ← build del SPA
    ├── assets/
    ├── manifest.webmanifest
    ├── sw.js
    ├── .htaccess                 ← reescritura SPA
    └── api/
        └── .htaccess             ← Passenger /api generado por cPanel
```

## Setup inicial (una sola vez)

### 1. Crear el subdominio

`cPanel → Dominios → Crear` con dominio `wms.chimuelo.cl` y document root `/home/USUARIO/wms.chimuelo.cl` (sin `public_html`).

### 2. Crear base de datos MySQL

`cPanel → MySQL Databases`:
- BD: `USUARIO_wms`
- Usuario: `USUARIO_wms`
- Asignar al usuario "All Privileges" sobre la BD.

### 3. Configurar la app Node.js

`cPanel → Setup Node.js App → Create Application`:

| Campo | Valor |
|---|---|
| Node.js version | 20.20.2 |
| Application mode | Production (para producción) |
| Application root | `wms.chimuelo.cl/backend` |
| Application URL | `wms.chimuelo.cl` con path `/api` |
| Application startup file | `server.js` |

> El path `/api` es lo que hace que Passenger solo intercepte URLs bajo `wms.chimuelo.cl/api/*` y deje todo el resto para que Apache sirva la SPA.

En **Environment variables**, añadir todas las del `backend/.env.example`:

```
NODE_ENV=production
PORT=4000
FRONTEND_ORIGIN=https://wms.chimuelo.cl
DATABASE_URL=mysql://USUARIO_wms:PASSWORD@localhost:3306/USUARIO_wms
WP_BASE_URL=https://chimuelo.cl
WP_JWT_SECRET=...
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
WC_WEBHOOK_SECRET=...
META_PRODUCT_WAREHOUSE=_wms_bodega
META_ORDER_ROUTE=_wdg_route
META_ORDER_STOP_POSITION=_wdg_stop_position
```

Click **Create**. Aún no arranca porque la carpeta `backend/` no existe; eso lo hace el primer deploy.

### 3.1. Crear la carpeta física `/api`

cPanel/CloudLinux necesita una carpeta física para el path del **Application URL**. Antes de guardar la app con URL `/api`, crea:

```bash
mkdir -p ~/wms.chimuelo.cl/api
```

Si esa carpeta no existe, cPanel puede fallar al guardar con:

```text
Unable to set environment variables in htaccess file for the application.
[Errno 2] No such file or directory: '/home/USUARIO/wms.chimuelo.cl/api/.htaccess'
```

Después de guardar la app, cPanel escribe en `~/wms.chimuelo.cl/api/.htaccess` un bloque parecido a:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/USUARIO/wms.chimuelo.cl/backend"
PassengerBaseURI "/api"
PassengerNodejs "/home/USUARIO/nodevenv/wms.chimuelo.cl/backend/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

Ese bloque es obligatorio para que `https://wms.chimuelo.cl/api/*` llegue al backend Express. Si falta, el login falla con un `404 Not Found` HTML de LiteSpeed en `POST /api/auth/login`.

En la raíz `~/wms.chimuelo.cl/.htaccess` deben ir las reglas SPA. La regla de `/api` deja que Apache entre a la carpeta `api/` y procese su `.htaccess` de Passenger:

```apache
RewriteEngine On
RewriteBase /

RewriteRule ^backend(/.*)?$  - [F,L]
RewriteRule ^frontend(/.*)?$ - [F,L]
RewriteRule ^docs(/.*)?$     - [F,L]
RewriteRule ^\.cpanel\.yml$  - [F,L]
RewriteRule ^\.git(/.*)?$    - [F,L]

RewriteRule ^api(/.*)?$ - [L]

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteRule ^ /index.html [L]
Options -Indexes
```

El deploy crea la carpeta `api/` si falta y excluye el `.htaccess` raíz para no borrar reglas configuradas en cPanel.

### 4. Configurar Git Version Control

`cPanel → Git Version Control → Create`:

- **Clone a Repository:** sí
- **Clone URL:** `git@github.com:tuusuario/wms-chimuelo.git` (o HTTPS con token)
- **Repository Path:** `/home/USUARIO/repos/wms-chimuelo`
- **Repository Name:** `wms-chimuelo`

Si usas SSH con GitHub, asegúrate de que la clave pública del cPanel (`cPanel → SSH Access → Manage SSH Keys`) esté agregada como **Deploy Key** en el repo de GitHub.

Una vez clonado, en la fila del repo en cPanel verás botones **Manage**, **Pull or Deploy** y otros.

### 5. Primer deploy

`cPanel → Git Version Control → tu repo → Manage → Pull or Deploy`:

1. **Update from Remote** — trae los últimos commits.
2. **Deploy HEAD Commit** — ejecuta `.cpanel.yml`, que:
   - Copia `backend/` a `wms.chimuelo.cl/backend/`
   - Instala dependencias del backend con `npm ci --omit=dev`
   - Genera el cliente Prisma
   - Construye el frontend con `npm run build`
   - Copia `frontend/dist/` a la raíz del subdominio sin sobrescribir `.htaccess`

El primer deploy puede tardar 1-3 min (instalación de dependencias).

### 6. Migrar la base de datos

Aún por SSH (`cPanel → Terminal`):

```bash
source ~/nodevenv/wms.chimuelo.cl/backend/20/bin/activate
cd ~/wms.chimuelo.cl/backend
npx prisma migrate deploy
```

### 7. Restart de la app

`cPanel → Setup Node.js App → Restart` sobre la app `wms.chimuelo.cl/api`.

### 8. Verificar

```bash
curl https://wms.chimuelo.cl/api/health
```

Debe responder:
```json
{"status":"ok","db":"ok","ts":"..."}
```

Abrir `https://wms.chimuelo.cl/` en el navegador — debe cargar la pantalla de login.

## Deploys posteriores

```bash
# En tu equipo local:
git add .
git commit -m "..."
git push origin main
```

En cPanel:
1. `Git Version Control → tu repo → Manage → Pull or Deploy`
2. **Update from Remote**
3. **Deploy HEAD Commit**
4. Si tocaste `prisma/schema.prisma`, abrir Terminal y correr `npx prisma migrate deploy` (ver paso 6).
5. **Restart** de la app Node si tocaste el backend.

## Workflow recomendado

- **Solo cambios de backend:** después del deploy, hacer Restart.
- **Solo cambios de frontend:** no requiere Restart. El navegador refresca el service worker automáticamente.
- **Cambios de schema:** deploy + `prisma migrate deploy` por SSH + Restart.

## Troubleshooting

### "Cannot find module" al iniciar la app

`npm ci` falló durante el deploy. Revisar los logs del deploy en `cPanel → Git Version Control → Last Deployment`. Comprobar también que `npm ci --omit=dev` no excluye una dep que el runtime sí necesita.

### "Environment variable not found: DATABASE_URL"

Las env vars no están seteadas en la app Node, o no se hizo Restart después de añadirlas. Revisar `cPanel → Setup Node.js App → tu app → Environment variables` y hacer Restart.

### 502 al abrir la SPA

La app Node está caída. Logs en:
- `~/nodevenv/wms.chimuelo.cl/backend/20/passenger.log`
- `cPanel → Errors`

### El SPA muestra 404 al recargar en una ruta tipo `/sequences/5`

Faltan las reglas SPA en `~/wms.chimuelo.cl/.htaccess`. Verificar que incluye las reglas de reescritura indicadas arriba y que mantiene `RewriteRule ^api(/.*)?$ - [L]`.

### Login devuelve 404 HTML de LiteSpeed en `/api/auth/login`

El request no está llegando a Node/Express. Verificar `https://wms.chimuelo.cl/api/health`:

- Si responde HTML de LiteSpeed con 404, falta el bloque Passenger en `~/wms.chimuelo.cl/api/.htaccess`, falta la carpeta física `api/`, o la app Node no está configurada con URL `/api`.
- Si responde JSON con `{"status":"ok",...}`, el backend sí está activo y el problema está en credenciales, WordPress/JWT o variables de entorno.
- Si responde 502, revisar logs de Passenger y reiniciar la app Node.

Para repararlo rápido, crear `~/wms.chimuelo.cl/api`, entrar a `cPanel → Setup Node.js App`, abrir la app `wms.chimuelo.cl/api`, guardar/reiniciar para que cPanel regenere `api/.htaccess`, y verificar que la raíz mantiene las reglas SPA indicadas arriba.

### El webhook de WC devuelve 401

`WC_WEBHOOK_SECRET` en el env de la app Node no coincide con el secret configurado en el webhook de WooCommerce. Verificar ambos lados.

## Logs

- Stdout/stderr de la app: `cPanel → Setup Node.js App → tu app → "Show Logs"` o vía SSH `~/nodevenv/wms.chimuelo.cl/backend/20/passenger.log`.
- Apache: `cPanel → Metrics → Errors`.
- Deploy: `cPanel → Git Version Control → Manage → Last Deployment`.

## Backups

cPanel hace backup diario de la BD. Verificar también que `wms.chimuelo.cl/.env` (si existe) esté en backup. El código no es crítico — está en git.
