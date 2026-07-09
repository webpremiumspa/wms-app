import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { maybeAutoCloseProcess } from './processes.js';

// Ventana de 30 segundos desde el registro dentro de la cual el mismo actor
// puede deshacer un bulto. Después, solo un supervisor con vista aparte
// podría corregir (por ahora no expuesto).
const UNDO_WINDOW_MS = 30_000;

// Multi-bulto: registra un bulto como clasificado o cargado. Es idempotente
// gracias al UNIQUE (order_id, bag_number, event). Cuando la cantidad de
// eventos alcanza bagsExpected para ese `event`, transiciona el status del
// pedido y setea el timestamp correspondiente.
//
// Args:
//   orderId    : PK interna del pedido
//   bagNumber  : 1..bagsExpected — el número físico del bulto
//   event      : 'classified' | 'loaded'
//   actorId    : wpUserId del operador
//
// Devuelve:
//   { complete: bool, progress: { done, total }, transitionedNow: bool }
export async function registerBagEvent({ orderId, bagNumber, event, actorId }) {
  if (event !== 'classified' && event !== 'loaded') {
    throw new HttpError(400, `Evento inválido: ${event}`);
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, 'Pedido no encontrado');

  const total = Math.max(1, order.bagsExpected ?? 1);
  if (bagNumber < 1 || bagNumber > total) {
    throw new HttpError(400, `Bulto ${bagNumber} fuera de rango (el pedido tiene ${total})`, {
      bagNumber, bagsExpected: total,
    });
  }

  // Validaciones específicas por evento — no permitir cargar antes de
  // clasificar TODO el pedido, y no permitir clasificar sin haber empacado.
  if (event === 'classified') {
    if (!['packed', 'classified'].includes(order.status)) {
      throw new HttpError(409, `No se puede clasificar en estado "${order.status}". Debe estar packed.`);
    }
    if (!order.route) throw new HttpError(409, 'El pedido no tiene ruta asignada.');
  } else if (event === 'loaded') {
    if (!['classified', 'loaded'].includes(order.status)) {
      throw new HttpError(409, `No se puede cargar en estado "${order.status}". Debe estar classified.`);
    }
    if (!order.route) throw new HttpError(409, 'El pedido no tiene ruta asignada.');
  }

  // Idempotencia + auditoría por bulto (v0.25.5): antes usábamos upsert que
  // no distinguía "creado" vs "ya existía", y el timeline solo veía el evento
  // consolidado dispatch.classified/loaded al completar los N — se perdía la
  // trazabilidad de cada scan individual (quién/cuándo por bulto).
  // Ahora chequeamos primero. Si el bag event NO existía, lo creamos junto
  // con un evento auditable dispatch.bag_${event} con payload { bagNumber }.
  // Si ya existía (re-scan), no hacemos nada — idempotente sin ruido de logs.
  const existing = await prisma.orderBagEvent.findUnique({
    where: { uq_order_bag_event: { orderId, bagNumber, event } },
  });

  if (!existing) {
    await prisma.$transaction([
      prisma.orderBagEvent.create({
        data: { orderId, bagNumber, event, actorId },
      }),
      prisma.event.create({
        data: {
          type: `dispatch.bag_${event}`, // dispatch.bag_classified | dispatch.bag_loaded
          actorId,
          orderId,
          payload: { bagNumber, event, bagsExpected: total },
        },
      }),
    ]);
  }

  const done = await prisma.orderBagEvent.count({
    where: { orderId, event },
  });

  const complete = done >= total;
  let transitionedNow = false;

  // Transición de status solo si acabamos de completar los N (no si ya estaba
  // completo). Registramos un evento auditable dispatch.classified/loaded.
  if (complete) {
    const alreadyDone = event === 'classified'
      ? !!order.classifiedAt
      : !!order.loadedAt;
    if (!alreadyDone) {
      const now = new Date();
      if (event === 'classified') {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'classified', classifiedAt: now },
          }),
          prisma.event.create({
            data: { type: 'dispatch.classified', actorId, orderId },
          }),
        ]);
      } else {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'loaded', loadedAt: now },
          }),
          prisma.event.create({
            data: { type: 'dispatch.loaded', actorId, orderId },
          }),
        ]);
        // Auto-cierre del proceso si era el último pedido.
        const seqLink = await prisma.sequenceOrder.findFirst({
          where: { orderId },
          select: { sequence: { select: { processId: true } } },
        });
        if (seqLink?.sequence?.processId) {
          await maybeAutoCloseProcess({
            processId: seqLink.sequence.processId,
            actorId,
          });
        }
      }
      transitionedNow = true;
    }
  }

  return { complete, progress: { done, total }, transitionedNow };
}

// Deshacer: borra el evento del bulto siempre que caiga dentro de la ventana
// de 30s desde el registro Y el mismo actor lo ejecute. Si al deshacer el
// pedido estaba en status='classified'/'loaded' por haber completado los N,
// también revierte el status y el timestamp asociado (porque ya no está
// completo). Deja un evento auditable 'bag.unclassified' / 'bag.unloaded'.
export async function undoBagEvent({ orderId, bagNumber, event, actorId }) {
  if (event !== 'classified' && event !== 'loaded') {
    throw new HttpError(400, `Evento inválido: ${event}`);
  }
  const existing = await prisma.orderBagEvent.findUnique({
    where: { uq_order_bag_event: { orderId, bagNumber, event } },
  });
  if (!existing) {
    throw new HttpError(404, `No hay bulto ${bagNumber} registrado como ${event} para este pedido.`);
  }

  const elapsed = Date.now() - new Date(existing.createdAt).getTime();
  if (elapsed > UNDO_WINDOW_MS) {
    throw new HttpError(409, `Ventana de 30s vencida. Un supervisor debe corregir manualmente.`, {
      elapsedMs: elapsed, windowMs: UNDO_WINDOW_MS,
    });
  }
  // Restringimos el undo al mismo actor que lo creó para evitar que otro
  // conductor borre por error un bulto ajeno recién registrado.
  if (existing.actorId && actorId && existing.actorId !== actorId) {
    throw new HttpError(403, 'Solo quien registró el bulto puede deshacerlo dentro de la ventana.');
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, 'Pedido no encontrado');

  // Si el pedido ya había pasado a status='classified'/'loaded' por completar
  // los N bultos, hay que revertirlo también porque este undo lo deja
  // incompleto de nuevo.
  const wasComplete = event === 'classified'
    ? !!order.classifiedAt && order.status === 'classified'
    : !!order.loadedAt && order.status === 'loaded';

  const ops = [
    prisma.orderBagEvent.delete({
      where: { uq_order_bag_event: { orderId, bagNumber, event } },
    }),
    prisma.event.create({
      data: {
        type: event === 'classified' ? 'bag.unclassified' : 'bag.unloaded',
        actorId,
        orderId,
        payload: { bagNumber, event, originalActorId: existing.actorId, originalAt: existing.createdAt },
      },
    }),
  ];

  if (wasComplete) {
    if (event === 'classified') {
      ops.push(prisma.order.update({
        where: { id: orderId },
        data: { status: 'packed', classifiedAt: null },
      }));
    } else {
      ops.push(prisma.order.update({
        where: { id: orderId },
        data: { status: 'classified', loadedAt: null },
      }));
    }
  }

  await prisma.$transaction(ops);

  const done = await prisma.orderBagEvent.count({
    where: { orderId, event },
  });
  const total = Math.max(1, order.bagsExpected ?? 1);
  return { progress: { done, total }, revertedStatus: wasComplete };
}

// Devuelve los bultos registrados para un pedido como un objeto:
//   { classified: [{bag, at, actorName}], loaded: [{bag, at, actorName}] }
// Útil para construir el response de vistas que muestran el progreso.
export async function getBagEventsFor(orderId) {
  const rows = await prisma.orderBagEvent.findMany({
    where: { orderId },
    include: { actor: { select: { displayName: true, username: true } } },
    orderBy: { bagNumber: 'asc' },
  });
  const classified = [];
  const loaded = [];
  for (const r of rows) {
    const entry = {
      bag: r.bagNumber,
      at: r.createdAt,
      actorName: r.actor?.displayName || r.actor?.username || null,
    };
    if (r.event === 'classified') classified.push(entry);
    else if (r.event === 'loaded') loaded.push(entry);
  }
  return { classified, loaded };
}
