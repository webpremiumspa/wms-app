# WMS Chimuelo

Sistema de Gestión de Preparación de Pedidos para Chimuelo. Aplicación web mobile-first que se integra con WordPress + WooCommerce.

- Backend: Node.js 20 + Express + Prisma + MySQL en cPanel
- Frontend: React 18 + Vite + Tailwind + PWA
- Auth: JWT del plugin "JWT Authentication for WP REST API"
- App URL producción: `wms.chimuelo.cl`
- Staging WP: `dev.chimuelo.cl`

## Estructura

```
backend/    API Express, conexión WC, prisma schema
frontend/   SPA React + Vite, PWA
docs/       Setup WordPress, despliegue cPanel, arquitectura
```

## Quick start (local)

Requisitos: Node.js 20.x, MySQL 5.7+ local.

```powershell
# Backend
cd backend
copy .env.example .env   # editar valores
npm install
npx prisma migrate dev
npm run dev              # arranca en http://localhost:4000

# Frontend (en otra terminal)
cd frontend
copy .env.example .env   # editar VITE_API_URL si hace falta
npm install
npm run dev              # arranca en http://localhost:5173
```

## Documentación

- [docs/architecture.md](docs/architecture.md) — visión técnica y modelo de datos
- [docs/wordpress-setup.md](docs/wordpress-setup.md) — snippets PHP para WP (rol, capabilities, meta box producto, webhook)
- [docs/cpanel-deployment.md](docs/cpanel-deployment.md) — despliegue paso a paso en cPanel
