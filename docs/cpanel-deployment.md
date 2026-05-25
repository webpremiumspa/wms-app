# Despliegue en cPanel

Esta guía cubre el despliegue del backend Node.js y el frontend estático en cPanel, con el subdominio `wms.chimuelo.cl`.

## Antes de empezar

- Crear el subdominio `wms.chimuelo.cl` en `cPanel → Dominios` apuntando a una carpeta dedicada, por ejemplo `/home/USUARIO/wms.chimuelo.cl`.
- Crear una base de datos MySQL: `cPanel → MySQL Databases`
  - Nombre BD: `USUARIO_wms`
  - Usuario BD: `USUARIO_wms`
  - Asignar al usuario "All Privileges" sobre la BD.
- Tener SSH habilitado (recomendado) o usar Terminal de cPanel.

## 1. Backend (Node.js App)

### 1.1 Subir código

Opciones:
- **Git** (recomendado): `cPanel → Git Version Control → Create` apuntando al repo, rama `main`, deploy a `/home/USUARIO/wms-backend`.
- **Manual**: subir el contenido de `backend/` por SFTP a `/home/USUARIO/wms-backend`.

### 1.2 Crear app en "Setup Node.js App"

- `cPanel → Setup Node.js App → Create Application`
- **Node.js version:** 20.20.2
- **Application mode:** Production
- **Application root:** `wms-backend` (path relativo a home)
- **Application URL:** `wms.chimuelo.cl` con path `/api` *(ver nota abajo)*
- **Application startup file:** `server.js`

> **Nota sobre el path**: cPanel sirve la app Node bajo el path indicado. Si configuras `/api`, Passenger interceptará solo URLs que empiecen con `/api/` y el resto (la SPA) lo sirve cPanel desde `public_html` del subdominio.
> Alternativa: la app cubre la raíz (`/`) y dentro de Express servimos también los estáticos del frontend. Elige una sola estrategia. La guía asume **path `/api` para la app Node y la SPA en `public_html`**.

### 1.3 Variables de entorno

En la pantalla de la app, sección "Environment variables", añadir las del `backend/.env.example`. Las críticas:

```
NODE_ENV=production
PORT=4000
FRONTEND_ORIGIN=https://wms.chimuelo.cl
DATABASE_URL=mysql://USUARIO_wms:PASS@localhost:3306/USUARIO_wms
WP_BASE_URL=https://chimuelo.cl
WP_JWT_SECRET=...
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
WC_WEBHOOK_SECRET=...
META_PRODUCT_WAREHOUSE=_wms_bodega
META_ORDER_ROUTE=_wdg_route
META_ORDER_STOP_POSITION=_wdg_stop_position
```

### 1.4 Instalar dependencias y migrar BD

Desde la pantalla de la app, botón **"Run NPM Install"**.

Luego, abrir terminal SSH (`cPanel → Terminal`) y ejecutar el "Enter to the virtual environment" que muestra cPanel — algo como:

```bash
source /home/USUARIO/nodevenv/wms-backend/20/bin/activate && cd /home/USUARIO/wms-backend
npx prisma generate
npx prisma migrate deploy
```

### 1.5 Reiniciar la app

Botón **"Restart"** en la pantalla de la app.

Probar:
```
curl https://wms.chimuelo.cl/api/health
```
Debe devolver `{"status":"ok","db":"ok",...}`.

## 2. Frontend (SPA estática)

### 2.1 Build local

En tu equipo (no en cPanel):

```powershell
cd frontend
copy .env.example .env       # ajustar VITE_API_URL=https://wms.chimuelo.cl/api
npm install
npm run build
```

Esto genera `frontend/dist/`.

### 2.2 Subir build

Subir el **contenido** de `frontend/dist/` (no la carpeta, sino los archivos dentro) a `public_html` del subdominio en cPanel:

```
/home/USUARIO/wms.chimuelo.cl/
  ├── index.html
  ├── assets/
  ├── manifest.webmanifest
  ├── sw.js
  └── ...
```

### 2.3 Reescritura para SPA

Crear `/home/USUARIO/wms.chimuelo.cl/.htaccess`:

```apache
RewriteEngine On
RewriteBase /

# No reescribir /api/ (lo maneja la app Node)
RewriteCond %{REQUEST_URI} ^/api(/|$) [OR]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Resto va al index.html (SPA)
RewriteRule ^ /index.html [L]
```

### 2.4 Comprobar

Abrir `https://wms.chimuelo.cl` en el navegador móvil. Debe cargar la pantalla de login.

## 3. Actualizaciones

- Backend: `git pull` en el directorio de la app, `npx prisma migrate deploy` si hay cambios de schema, botón **Restart** de la app Node.
- Frontend: `npm run build` local, subir `dist/` a `public_html`, refrescar (PWA invalida el cache solo gracias a `registerType: 'autoUpdate'`).

## 4. Logs

- Stdout de la app Node: `cPanel → Setup Node.js App → ver "stderr.log" / "passenger.log"` o vía SSH en `/home/USUARIO/nodevenv/wms-backend/...`.
- Apache: `cPanel → Metrics → Errors`.

## 5. Backups

cPanel hace backup diario de la BD; también puedes programar `mysqldump` con `cron`. Recordar excluir `node_modules/` de los backups del sistema de archivos.
