# Reglas del proyecto WMS Chimuelo

## Idioma de la UI: español chileno con tuteo — NUNCA voseo argentino

**Esta es la regla más importante de la base de código. Aplica a TODO texto visible al usuario final**: copy de UI, mensajes de error, tooltips, modales, alertas, confirmaciones, copy del PDF de albaranes, banners, placeholders, títulos, botones. Sin excepción.

### Lo que NO está permitido (voseo argentino)

Verbos en imperativo conjugados con vos (tildes finales) o sus presentes:

- **NO**: forzá, usá, contactá, andá, mirá, dale, fijate, esperá, probá, pasá, tirá, borrá, pinchá, click(e)á, sacá, llamá, hacé, apretá, vení, salí, escribí, abrí, cerrá, sumá, restá, enviá, tocá, cargá, metelo, decí, segu[íi], elegí, abandoná, retirá, devolvé, asegurate, confirmá, verificá, incluí, subí, bajá, tomá, dejalo, imprimí, despegá, copi(á)/pegá, ingresá, completá, seleccioná, marcá, descontá
- **NO**: podés, tenés, querés, sabés, vas (en "vas a tener que" suena tolerable pero preferir "tendrás que")
- **NO**: pronombres ni vocativos: vos, che, boludo, dale (como "OK"), bárbaro

### Lo que SÍ se usa (tuteo chileno)

Mismo verbo pero con tú implícito (sin tilde final):

- **SÍ**: fuerza, usa, contacta, anda, mira, espera, prueba, pasa, tira, borra, pincha, saca, llama, haz, aprieta, ven, sal, escribe, abre, cierra, suma, resta, envía, toca, carga, mete, di, sigue, elige, retira, devuelve, asegúrate, confirma, verifica, incluye, sube, baja, toma, déjalo, imprime, despega, copia, pega, ingresa, completa, selecciona, marca, descuenta
- **SÍ**: puedes, tienes, quieres, sabes, tendrás que

### Cómo verificar antes de cualquier commit que toque texto visible

```bash
# Búsqueda rápida de voseo en frontend (debe devolver 0 hits en strings visibles)
rg -i -n '\b(forz[áa]|us[áa]|contact[áa]|and[áa]|mir[áa]|fij[áa]te|esper[áa]|prob[áa]|pinch[áa]|sac[áa]|llam[áa]|hac[ée]|apret[áa]|abr[íi]|cerr[áa]|envi[áa]|toc[áa]|carg[áa]|met[ée]|elegí|asegur[áa]|verific[áa]|inclu[íi]|sub[íi]|baj[áa]|tom[áa]|imprim[íi]|copi[áa]|peg[áa]|ingres[áa]|complet[áa]|seleccion[áa]|marc[áa]|descont[áa]|pod[ée]s|ten[ée]s|quer[ée]s|sab[ée]s|\bvos\b|\bche\b|\bdale\b)' frontend/src
```

Si aparece UN solo hit en un string visible (no en un comentario o variable), arréglalo antes del commit. Incidente recurrente: el usuario ha reportado >3 veces que se cuelan voseos — siempre arréglalos sin esperar reclamo.

---

## Workflow de git

- Rama de trabajo: **dev**. Nunca dejar al usuario en `main` tras un commit.
- Tras commitear: `git push origin dev && git push origin dev:main` (promoción directa, cPanel pull automático a `main`).
- Después de promover, verificar con `git branch --show-current` que sigues en `dev`.
- Cada cambio debe pasar por git — no parchar manualmente archivos en cPanel.

---

## Stack y arquitectura

Ver `memory/` para detalles. Resumen:

- **Backend**: Node 20 + Express + Prisma + MySQL en cPanel (Passenger). Cliente Prisma commiteado a `backend/generated/`. Migraciones: manuales en `backend/prisma/migrations-manual/` (NO automáticas, hay que correrlas en phpMyAdmin).
- **Frontend**: React 18 + Vite + Tailwind + PWA (vite-plugin-pwa, prompt mode). Auth vía WP JWT plugin.
- **Despliegue**: `git push origin dev:main` → cPanel auto-pull → reiniciar Node manualmente desde Setup Node.js App o tocando `tmp/restart.txt`.

---

## Antes de marcar una tarea como completa

- Si tocaste texto visible: **leer la regla de idioma de arriba** y verificar.
- Si tocaste schema Prisma: dejar la migración manual en `backend/prisma/migrations-manual/` con fecha y avisar al usuario que la corra antes del deploy.
- Si agregaste rutas backend: recordar al usuario que reinicie Node en cPanel tras el deploy.
- Si cambiaste assets del frontend: el usuario probablemente vea el SW viejo cacheado; mencionarle el botón "Forzar refresh" o el banner PWA.
