import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import { renderAlbaranPdf } from '../services/pdf.js';
import { updateOrderMetaFromWc } from '../services/orders-sync.js';
import { getBagEventsFor } from '../services/bag-events.js';
import { createPackPlan, deletePackPlan, closePackBag, getPackPlanFor } from '../services/pack-plan.js';
import { wcGetProduct, wcGetOrder, getMeta } from '../services/woocommerce.js';
import {
  approvePartialDelivery,
  revokePartialDelivery,
  unblockOrder,
  unpackOrder,
  revertOrderStep,
  reviveOrderFromReturn,
  reopenB2,
  getOrderLoadability,
  claimOrder,
} from '../services/order-actions.js';
import { packOrderB2 } from '../services/sequences.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth);

// Borra todos los pedidos pendientes (status='received', sin haber entrado a
// secuencia). Útil cuando se importan con metadata vieja y conviene volver a
// sincronizar desde cero.
router.delete('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (_req, res, next) => {
  try {
    const result = await prisma.order.deleteMany({ where: { status: 'received' } });
    res.json({ deleted: result.count });
  } catch (err) {
    next(err);
  }
});

// Búsqueda global de pedidos por number (substring match). Incluye TODOS los
// procesos abiertos y cerrados — el supervisor usa esto desde el índice de
// Procesos para encontrar un pedido sin saber a qué proceso pertenece.
// Devuelve hasta `limit` matches con el proceso y secuencia a los que
// pertenece cada pedido. Los pedidos sin secuencia/proceso (status='received')
// igual aparecen con processId/sequenceId=null.
router.get('/search', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 1) {
      return res.json({ matches: [] });
    }
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const orders = await prisma.order.findMany({
      where: { number: { contains: q } },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sequenceLinks: {
          include: {
            sequence: {
              select: {
                id: true,
                status: true,
                processId: true,
                process: { select: { id: true, name: true, status: true } },
              },
            },
          },
          take: 1, // un pedido vive en una sola secuencia a la vez
        },
      },
    });

    const matches = orders.map((o) => {
      const link = o.sequenceLinks[0];
      const seq = link?.sequence;
      const proc = seq?.process;
      return {
        id: o.id,
        wpOrderId: o.wpOrderId,
        number: o.number,
        status: o.status,
        customerName: o.customerName,
        route: o.route,
        stopPosition: o.stopPosition,
        hasB2Pending: o.hasB2Pending,
        deliveryStatus: o.deliveryStatus,
        deliveryMeta: o.deliveryMeta,
        createdAt: o.createdAt,
        sequenceId: seq?.id ?? null,
        sequenceStatus: seq?.status ?? null,
        processId: proc?.id ?? null,
        processName: proc?.name ?? null,
        processStatus: proc?.status ?? null,
      };
    });

    res.json({ matches, total: matches.length, query: q });
  } catch (err) {
    next(err);
  }
});

// v0.25.10: pedidos con estado de entrega "devuelto" (WMS='loaded' sin
// metas WDG). Vista dedicada para el supervisor: revisar la lista, buscar
// las bolsas físicas guardadas y revivir los que corresponda al pool activo.
router.get('/returned', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        deliveryStatus: 'returned',
        status: 'loaded',
      },
      orderBy: { deliveryStatusUpdatedAt: 'desc' },
      include: {
        items: { select: { warehouse: true } },
        sequenceLinks: {
          include: {
            sequence: {
              select: { id: true, createdAt: true, processId: true, process: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        wpOrderId: o.wpOrderId,
        number: o.number,
        customerName: o.customerName,
        customerCity: o.customerCity,
        route: o.route,
        stopPosition: o.stopPosition,
        status: o.status,
        hasB2Pending: o.hasB2Pending,
        hasB1Items: o.items.some((it) => it.warehouse === 'B1'),
        deliveryStatus: o.deliveryStatus,
        deliveryMeta: o.deliveryMeta,
        deliveryStatusUpdatedAt: o.deliveryStatusUpdatedAt,
        wcStatus: o.wcStatus,
        loadedAt: o.loadedAt,
        packedAt: o.packedAt,
        createdAt: o.createdAt,
        // Contexto: en qué proceso/secuencia estaba cuando se cargó al camión.
        sequenceLinks: o.sequenceLinks.map((l) => ({
          sequenceId: l.sequenceId,
          sequenceCreatedAt: l.sequence?.createdAt,
          processId: l.sequence?.processId,
          processName: l.sequence?.process?.name,
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// v0.25.18: consistencia estricta con el estado WC.
// El pool de pendientes son SOLO pedidos que actualmente están en WC como
// 'en-preparacion' (o sin wc_status seteado, que son pedidos recién
// sincronizados sin webhook posterior). Cualquier otro wc_status significa
// que el pedido cambió de estado en WC (asignado a ruta, cancelado,
// completado, etc.) y no debería aparecer en Nueva Secuencia — el operador
// no puede/debe secuenciarlo hasta que WC lo devuelva a 'en-preparacion'.
//
// Antes filtrábamos solo cerrados (v0.25.17), lo que dejaba pasar
// 'en-ruta-*'. Ahora la lista respeta 1:1 lo que el operador selecciona en
// el filtro de sincronización (que apunta a 'en-preparacion' por default).
const ACTIVE_POOL_WC_STATUS = 'en-preparacion';

router.get('/pending', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    // Default alto: el operador del WMS necesita ver TODOS los pendientes del
    // día para armar secuencias. Cap duro a 2000 para evitar payloads enormes.
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const pendingWhere = {
      status: 'received',
      OR: [
        { wcStatus: null },
        { wcStatus: ACTIVE_POOL_WC_STATUS },
      ],
    };
    const [total, orders] = await Promise.all([
      prisma.order.count({ where: pendingWhere }),
      prisma.order.findMany({
        where: pendingWhere,
        take: limit,
        orderBy: { createdAt: 'asc' },
        // items.warehouse permite calcular hasB1Items (para distinguir en el
        // filtro rapido "Solo B2" vs "Mixto"); el id sigue sirviendo para el
        // conteo total de items.
        include: { items: { select: { id: true, warehouse: true } } },
      }),
    ]);

    // Para cada pedido pendiente, su última remoción (si la tuvo). Sirve para
    // que el supervisor vea contexto al armar la próxima secuencia: si un
    // pedido fue removido hace 2h por "sin stock B2", probablemente NO lo
    // quiera incluir ahora. Una sola query trae todos los eventos de tipo
    // 'sequence.order_removed' de estos pedidos y agrupamos en JS.
    const orderIds = orders.map((o) => o.id);
    const removalEvents = orderIds.length > 0
      ? await prisma.event.findMany({
          where: { type: 'sequence.order_removed', orderId: { in: orderIds } },
          orderBy: { createdAt: 'desc' },
          select: { orderId: true, createdAt: true, payload: true },
        })
      : [];
    // Nos quedamos con la más reciente por pedido (el findMany ya viene desc).
    const lastRemovalByOrder = new Map();
    for (const ev of removalEvents) {
      if (!lastRemovalByOrder.has(ev.orderId)) {
        lastRemovalByOrder.set(ev.orderId, ev);
      }
    }

    res.json({
      total,
      limit,
      truncated: total > orders.length,
      orders: orders.map((o) => {
        const lastRem = lastRemovalByOrder.get(o.id);
        return {
          id: o.id,
          wpOrderId: o.wpOrderId,
          number: o.number,
          customerName: o.customerName,
          customerCity: o.customerCity,
          shippingMethod: o.shippingMethod,
          route: o.route,
          hasB2Pending: o.hasB2Pending,
          // hasB1Items = true si el pedido tiene al menos un item con
          // warehouse='B1'. Junto con hasB2Pending permite distinguir en el
          // filtro rapido de la vista Nueva Secuencia si el pedido es
          // Solo B1 / Solo B2 / Mixto.
          hasB1Items: o.items.some((it) => it.warehouse === 'B1'),
          wcStatus: o.wcStatus,
          wcStatusUpdatedAt: o.wcStatusUpdatedAt,
          // v0.25.9: estado de entrega derivado de metas WDG.
          deliveryStatus: o.deliveryStatus,
          deliveryMeta: o.deliveryMeta,
          itemCount: o.items.length,
          createdAt: o.createdAt,
          lastRemoval: lastRem
            ? {
                at: lastRem.createdAt,
                reasonCode: lastRem.payload?.reasonCode ?? null,
                reasonText: lastRem.payload?.reasonText ?? null,
                previousStatus: lastRem.payload?.previousStatus ?? null,
                sequenceId: lastRem.payload?.sequenceId ?? null,
                processId: lastRem.payload?.processId ?? null,
              }
            : null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// Seguimiento completo de un pedido: snapshot actual + timeline cronológica
// de eventos con actor humano (nombre del usuario WP). Solo supervisores.
router.get('/by-wp/:wpOrderId/tracking', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');

    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { wpUserId: true, displayName: true, username: true } },
        pickedBy: { select: { wpUserId: true, displayName: true, username: true } },
        b2ClosedBy: { select: { wpUserId: true, displayName: true, username: true } },
        sequenceLinks: {
          include: { sequence: { select: { id: true, createdAt: true, status: true, processId: true } } },
        },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado en el WMS`);

    // Eventos del pedido + lookup de los actores (display name desde users_meta).
    const events = await prisma.event.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    const actorIds = [...new Set(events.map((e) => e.actorId).filter((v) => v != null))];
    const actors = actorIds.length
      ? await prisma.userMeta.findMany({
          where: { wpUserId: { in: actorIds } },
          select: { wpUserId: true, displayName: true, username: true },
        })
      : [];
    const actorMap = new Map(actors.map((a) => [a.wpUserId, a]));

    const timeline = events.map((e) => ({
      id: e.id,
      type: e.type,
      createdAt: e.createdAt,
      actorId: e.actorId,
      actor: e.actorId ? actorMap.get(e.actorId) || null : null,
      // El campo real en la BD es `payload`; lo exponemos como `meta` para
      // no romper el contract del frontend (TrackingEvent.meta).
      meta: e.payload || null,
    }));

    res.json({
      order: {
        id: order.id,
        wpOrderId: order.wpOrderId,
        number: order.number,
        status: order.status,
        route: order.route,
        stopPosition: order.stopPosition,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        customerAddress2: order.customerAddress2,
        customerCity: order.customerCity,
        customerPhone: order.customerPhone,
        customerNote: order.customerNote,
        shippingMethod: order.shippingMethod,
        driverId: order.driverId,
        driverName: order.driverName,
        vehicle: order.vehicle,
        patente: order.patente,
        hasB2Pending: order.hasB2Pending,
        // v0.25.9: delivery status derivado de metas WDG.
        deliveryStatus: order.deliveryStatus,
        deliveryMeta: order.deliveryMeta,
        allowPartialDelivery: order.allowPartialDelivery,
        partialDeliveryNote: order.partialDeliveryNote,
        bagsExpected: order.bagsExpected,
        createdAt: order.createdAt,
        claimedAt: order.claimedAt,
        packedAt: order.packedAt,
        b2ClosedAt: order.b2ClosedAt,
        classifiedAt: order.classifiedAt,
        loadedAt: order.loadedAt,
        deliveredAt: order.deliveredAt,
        updatedAt: order.updatedAt,
        pickedBy: order.pickedBy,
        packedBy: order.packedBy,
        b2ClosedBy: order.b2ClosedBy,
        sequenceLinks: order.sequenceLinks.map((sl) => ({
          sequenceId: sl.sequenceId,
          sequence: sl.sequence,
        })),
        items: order.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          qty: it.qty,
          warehouse: it.warehouse,
          lineName: it.lineName,
          pickedAt: it.pickedAt,
          packedAt: it.packedAt,
          product: it.product
            ? {
                wpProductId: it.product.wpProductId,
                sku: it.product.sku,
                name: it.product.name,
                thumbnailUrl: it.product.thumbnailUrl,
              }
            : null,
        })),
      },
      timeline,
    });
  } catch (err) {
    next(err);
  }
});

// Resincroniza un pedido específico con WC: refresca metadata (ruta, parada,
// método de envío, conductor, vehículo, patente) y datos del cliente (nombre,
// dirección, depto, comuna, teléfono, nota). NO toca status, items ni
// timestamps WMS — eso pertenece al WMS, no a WC.
//
// Útil cuando el supervisor ve en Diagnóstico una diferencia entre WC y WMS
// para un pedido que ya está en estado avanzado (packed, classified, loaded)
// y el sync masivo lo saltea por ese motivo. Mismo helper que dispara el
// webhook de WC al editar el pedido — comportamiento idéntico, manual.
router.post('/by-wp/:wpOrderId/resync', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');

    const existing = await prisma.order.findUnique({
      where: { wpOrderId },
      select: { id: true },
    });
    if (!existing) {
      throw new HttpError(404, `Pedido ${wpOrderId} no está sincronizado en el WMS. Usa "Sincronizar pedidos" primero.`);
    }

    const updated = await updateOrderMetaFromWc(wpOrderId);
    res.json({
      ok: true,
      wpOrderId,
      route: updated?.route ?? null,
      stopPosition: updated?.stopPosition ?? null,
      shippingMethod: updated?.shippingMethod ?? null,
      driverName: updated?.driverName ?? null,
    });
  } catch (err) {
    next(err);
  }
});

// Lookup por wpOrderId (el ID que viene del QR escaneado).
router.get('/by-wp/:wpOrderId', requireCap(WMS_CAPS.LOAD, WMS_CAPS.SUPERVISE, WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { wpUserId: true, displayName: true, username: true } },
        pickedBy: { select: { wpUserId: true, displayName: true, username: true } },
        sequenceLinks: {
          include: { sequence: { select: { id: true, createdAt: true, status: true, processId: true } } },
        },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado en el WMS`);

    // Enriquece con el progreso multi-bulto — para vistas autenticadas del
    // scan (mismo consumo que /public/orders/:wpOrderId). Incluye también
    // el pack plan si el pedido es multi-bulto con plan asignado.
    const bagProgress = await getBagEventsFor(order.id);
    const packPlan = await getPackPlanFor(order.id);
    res.json({
      order: {
        ...order,
        bagsClassified: bagProgress.classified,
        bagsLoaded: bagProgress.loaded,
        packPlan,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE, WMS_CAPS.LOAD, WMS_CAPS.PACK_B2), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        packedBy: { select: { wpUserId: true, displayName: true, username: true } },
        pickedBy: { select: { wpUserId: true, displayName: true, username: true } },
        b2ClosedBy: { select: { wpUserId: true, displayName: true, username: true } },
        sequenceLinks: {
          include: { sequence: { select: { id: true, createdAt: true, status: true, processId: true } } },
        },
      },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    // Enriquece con progreso multi-bulto + pack plan (v0.24.0).
    const bagProgress = await getBagEventsFor(order.id);
    const packPlan = await getPackPlanFor(order.id);
    res.json({
      order: {
        ...order,
        bagsClassified: bagProgress.classified,
        bagsLoaded: bagProgress.loaded,
        packPlan,
      },
    });
  } catch (err) {
    next(err);
  }
});

const packSchema = z.object({
  // Puede venir vacío en pedidos que solo tienen items de Bodega 2 (no hay nada
  // que empacar físicamente desde B1, pero el pedido igual se cierra para
  // imprimir el albarán que lleva los items a sacar del granel).
  itemIds: z.array(z.number().int().positive()),
  // Solo se setea cuando el picker confirma el modal de "secuencia antigua"
  // (la secuencia no es de hoy ni de ayer). Sirve para auditoría: queda
  // registrado en eventos que se empacó deliberadamente desde un albarán viejo.
  confirmedOldSequence: z.boolean().optional(),
  // Cantidad de bultos físicos que generó el empaque (default 1). El picker
  // lo declara antes de cerrar; al imprimir N>1 albaranes pre-numerados se
  // garantiza identificación de cada bolsa y el cargador puede verificar
  // que tiene todos los bultos.
  bagsExpected: z.number().int().min(1).max(20).optional(),
});

const updateBagsSchema = z.object({
  bagsExpected: z.number().int().min(1).max(20),
});

const packB2Schema = z.object({
  itemIds: z.array(z.number().int().positive()),
  confirmedOldSequence: z.boolean().optional(),
});

// Cierre B2 por pedido: el picker B2 escanea el QR, marca los items B2 que
// pone en la sub-bolsa del pedido y cierra. Mismo modelo que el pack B1
// pero solo afecta items B2 y setea order.b2ClosedAt.
router.post('/:id/pack-b2', requireCap(WMS_CAPS.PACK_B2), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = packB2Schema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const result = await packOrderB2({
      orderId: id,
      itemIds: parsed.data.itemIds,
      actorId: req.user.wpUserId,
      confirmedOldSequence: parsed.data.confirmedOldSequence === true,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Loadability check para un pedido: sirve para la UI de Dispatch (mostrar
// banner rojo antes de tocar el botón Cargar).
router.get('/:id/loadability', requireCap(WMS_CAPS.LOAD, WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await getOrderLoadability(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const partialDeliverySchema = z.object({
  note: z.string().max(500).optional(),
});

// Aprueba entrega parcial: el cliente acepta recibir aunque falten items B2.
router.post('/:id/partial-delivery', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const parsed = partialDeliverySchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const id = Number(req.params.id);
    const result = await approvePartialDelivery({
      orderId: id,
      note: parsed.data.note,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/partial-delivery', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await revokePartialDelivery({
      orderId: id,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Claim: el picker toma el pedido al escanear el QR (o entrar desde la lista).
// Modelo "último escaneo gana": si ya estaba tomado por otro, se reasigna a
// este actor. Solo el último claimer puede cerrar el pedido — el anterior
// recibe error 403 al intentar el pack si otro lo tomó después.
router.post('/:id/claim', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await claimOrder({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Desbloquea un pedido en estado `blocked` → vuelve a `received` para entrar
// a una nueva secuencia.
router.post('/:id/unblock', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await unblockOrder({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Desempaca un pedido (packed/classified) → vuelve a `sequenced`. Útil cuando
// se cerró por error o durante pruebas. No se permite si ya fue cargado al
// vehículo o entregado.
router.post('/:id/unpack', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await unpackOrder({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Revertir un paso (v0.25.1). Solo SUPERVISE. Retrocede el pedido UN estado:
//   loaded → classified   (borra bag events loaded)
//   classified → packed   (borra bag events classified)
//   packed → sequenced    (equivalente al POST /unpack)
// Ver services/order-actions.js:revertOrderStep para detalles.
router.post('/:id/revert-step', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await revertOrderStep({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// v0.25.10/13: revivir un pedido devuelto sin entregar. Solo SUPERVISE.
// Endpoint manual — la mayoría de los revives ahora son automáticos vía
// webhook cuando llega la meta _wdg_not_delivered='1' del sistema de rutas.
// Este endpoint queda como fallback (por si el webhook no llegó o para
// casos edge donde el supervisor necesita revivir uno específico).
// Ver services/order-actions.js:reviveOrderFromReturn para la lógica.
router.post('/:id/revive-from-return', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await reviveOrderFromReturn({
      orderId: id,
      actorId: req.user.wpUserId,
      trigger: 'manual',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Reabre el cierre B2 de un pedido (limpia b2ClosedAt y resetea items B2).
// Independiente del flujo B1. Se usa cuando el picker B2 cerró por error
// o en pruebas.
router.post('/:id/reopen-b2', requireCap(WMS_CAPS.PACK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await reopenB2({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Multi-bulto (v0.24.0): pack plan y cierre por bulto ────────────────
// Ver services/pack-plan.js para la lógica completa. El plan permite que
// varios pickers preparen distintos bultos del mismo pedido en paralelo.

const packPlanSchema = z.object({
  bagsExpected: z.number().int().min(2).max(6),
  assignments: z.array(z.object({
    orderItemId: z.number().int().positive(),
    bagNumber: z.number().int().min(1).max(6),
    // v0.24.2: qty por bulto (un item con qty>1 puede dividirse).
    qty: z.number().int().positive(),
  })).min(1),
});

router.post('/:id/pack-plan', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = packPlanSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const result = await createPackPlan({
      orderId: id,
      bagsExpected: parsed.data.bagsExpected,
      assignments: parsed.data.assignments,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/pack-plan', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await deletePackPlan({ orderId: id, actorId: req.user.wpUserId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const packBagSchema = z.object({
  itemIds: z.array(z.number().int().positive()).min(1),
});

router.post('/:id/pack/:bag/close', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const bag = Number(req.params.bag);
    const parsed = packBagSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const result = await closePackBag({
      orderId: id,
      bagNumber: bag,
      itemIds: parsed.data.itemIds,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Packing single-bulto (legacy): el operador confirma los items B1
// introducidos en la bolsa. Solo aplica cuando bagsExpected=1 (o no hay
// plan). Con plan → tira 409 pidiendo usar /pack/:bag/close.
router.post('/:id/pack', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = packSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, bagAssignments: { select: { id: true }, take: 1 } },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status === 'packed') throw new HttpError(409, 'Order already packed');

    // Multi-bulto con plan: el pack directo no aplica; hay que usar /pack/:bag/close.
    if (order.bagAssignments.length > 0) {
      throw new HttpError(409, 'Este pedido tiene un plan de empaque multi-bulto activo. Usa POST /orders/:id/pack/:bag/close para cerrar bulto a bulto.', {
        multiBagPlan: true,
      });
    }

    // Validación de claim: solo el último picker que escaneó puede cerrar.
    // Si otro picker escaneó después, este usuario debe recargar — el pedido
    // ya no es suyo.
    if (order.pickedById && order.pickedById !== req.user.wpUserId) {
      throw new HttpError(403, 'Este pedido fue reasignado a otro picker. Recarga la página para continuar.', {
        currentPickerId: order.pickedById,
      });
    }

    const b1Items = order.items.filter((i) => i.warehouse === 'B1');
    const required = new Set(b1Items.map((i) => i.id));
    const confirmed = new Set(parsed.data.itemIds);
    // Solo verificamos completitud si el pedido tiene items B1. Si solo tiene
    // B2, no hay nada que empacar y el pedido se cierra directo.
    if (b1Items.length > 0) {
      const missing = [...required].filter((x) => !confirmed.has(x));
      if (missing.length > 0) {
        throw new HttpError(409, 'All B1 items must be checked before packing', { missingItemIds: missing });
      }
    }

    const now = new Date();
    // Soporta modo 'by_order': si los items aún no tenían pickedAt (porque no
    // hubo paso previo de picking), lo seteamos ahora junto al packedAt.
    // Idempotente: no pisa pickedAt si ya estaba.
    const itemUpdates = confirmed.size > 0 ? [
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id, pickedAt: null },
        data: { pickedAt: now },
      }),
      prisma.orderItem.updateMany({
        where: { id: { in: [...confirmed] }, orderId: id },
        data: { packedAt: now },
      }),
    ] : [];

    // bagsExpected: si el picker no manda nada, mantenemos el default 1.
    // Se valida explícitamente porque el schema lo deja optional.
    const bags = parsed.data.bagsExpected ?? 1;

    await prisma.$transaction([
      ...itemUpdates,
      prisma.order.update({
        where: { id },
        data: {
          status: 'packed',
          packedAt: now,
          packedById: req.user.wpUserId,
          bagsExpected: bags,
        },
      }),
      prisma.event.create({
        data: {
          type: 'order.packed',
          actorId: req.user.wpUserId,
          orderId: id,
          payload: { itemIds: [...confirmed], onlyB2: b1Items.length === 0, bagsExpected: bags },
        },
      }),
    ]);

    // Evento de auditoría aparte cuando el picker confirmó una secuencia antigua.
    // Sirve para que el supervisor detecte si esto pasa frecuentemente.
    if (parsed.data.confirmedOldSequence) {
      await prisma.event.create({
        data: {
          type: 'order.packed_from_old_sequence',
          actorId: req.user.wpUserId,
          orderId: id,
          payload: {},
        },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Diagnóstico de un pedido: muestra qué dice WC vs qué tenemos local.
// Útil para entender por qué falta una ruta, una posición de carga, o por qué
// los items aparecen como esperaba.
router.get('/debug-order/:wpOrderId', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const wpId = Number(req.params.wpOrderId);
    if (!wpId) throw new HttpError(400, 'Invalid wpOrderId');

    const local = await prisma.order.findUnique({
      where: { wpOrderId: wpId },
      include: { items: { include: { product: true } } },
    });

    let wc = null;
    let wcError = null;
    try {
      const data = await wcGetOrder(wpId);
      const routeKey = config.meta.orderRoute;
      const stopKey = config.meta.orderStopPosition;
      wc = {
        id: data.id,
        number: data.number,
        status: data.status,
        date_created: data.date_created,
        billing_name: [data.billing?.first_name, data.billing?.last_name].filter(Boolean).join(' '),
        shipping_address: [data.shipping?.address_1, data.shipping?.city].filter(Boolean).join(', '),
        meta_data_count: (data.meta_data || []).length,
        meta_data: data.meta_data || [],
        routeMetaKey: routeKey,
        routeMetaFound: (data.meta_data || []).find((m) => m.key === routeKey) || null,
        routeResolved: getMeta(data, routeKey) || null,
        stopPositionMetaKey: stopKey,
        stopPositionMetaFound: (data.meta_data || []).find((m) => m.key === stopKey) || null,
        stopPositionResolved: getMeta(data, stopKey) || null,
        line_items_count: (data.line_items || []).length,
        line_items: (data.line_items || []).map((li) => ({
          product_id: li.product_id,
          name: li.name,
          quantity: li.quantity,
          sku: li.sku,
        })),
      };
    } catch (e) {
      wcError = e.message;
    }

    res.json({
      wpOrderId: wpId,
      configKeys: {
        orderRoute: config.meta.orderRoute,
        orderStopPosition: config.meta.orderStopPosition,
      },
      local: local
        ? {
            id: local.id,
            wpOrderId: local.wpOrderId,
            number: local.number,
            status: local.status,
            route: local.route,
            stopPosition: local.stopPosition,
            customerName: local.customerName,
            customerAddress: local.customerAddress,
            customerNote: local.customerNote,
            shippingMethod: local.shippingMethod,
            hasB2Pending: local.hasB2Pending,
            createdAt: local.createdAt,
            packedAt: local.packedAt,
            items: local.items.map((it) => ({
              id: it.id,
              productId: it.productId,
              productName: it.product?.name,
              sku: it.product?.sku,
              qty: it.qty,
              warehouse: it.warehouse,
              pickedAt: it.pickedAt,
              packedAt: it.packedAt,
            })),
          }
        : null,
      wc,
      wcError,
      diagnosis: buildOrderDiagnosis(local, wc),
    });
  } catch (err) {
    next(err);
  }
});

// Genera mensajes interpretables de qué pasa en cada caso, para que el supervisor
// no tenga que comparar campo por campo manualmente.
function buildOrderDiagnosis(local, wc) {
  const notes = [];
  if (!local) notes.push('El pedido NO está sincronizado en el WMS (no existe localmente).');
  if (!wc && local) notes.push('No se pudo leer WC — solo datos locales disponibles.');
  if (local && wc) {
    if (local.route !== (wc.routeResolved || null)) {
      notes.push(`Ruta desincronizada: local="${local.route ?? 'null'}" vs WC="${wc.routeResolved ?? 'null'}". Re-sincronizar para refrescar.`);
    }
    const wcStop = wc.stopPositionResolved != null ? Number(wc.stopPositionResolved) : null;
    if (local.stopPosition !== wcStop) {
      notes.push(`Posición de carga desincronizada: local="${local.stopPosition ?? 'null'}" vs WC="${wcStop ?? 'null'}".`);
    }
    if (wc.routeResolved == null) {
      notes.push(`WC no tiene meta "${wc.routeMetaKey}" — el pedido no tiene ruta asignada en WooCommerce.`);
    }
    const lockedStatuses = ['picked', 'packed', 'classified', 'loaded', 'delivered'];
    if (lockedStatuses.includes(local.status)) {
      notes.push(`Pedido en estado "${local.status}" — el sync ahora lo saltea. Para refrescar metadata hay que eliminar la secuencia primero.`);
    }
  }
  return notes.length > 0 ? notes : ['Todo coincide entre WC y local.'];
}

// Diagnóstico de un producto: muestra qué dice WC + qué tenemos local. Útil
// para entender por qué un item sigue marcado como B1 cuando deberia ser B2.
router.get('/debug-product/:wpProductId', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const wpId = Number(req.params.wpProductId);
    if (!wpId) throw new HttpError(400, 'Invalid wpProductId');

    const local = await prisma.productMeta.findUnique({ where: { wpProductId: wpId } });
    let wc = null;
    let wcError = null;
    try {
      const data = await wcGetProduct(wpId);
      wc = {
        id: data.id,
        sku: data.sku,
        name: data.name,
        meta_data_count: (data.meta_data || []).length,
        meta_data: data.meta_data || [],
        warehouseMetaKey: config.meta.productWarehouse,
        warehouseMetaFound: (data.meta_data || []).find((m) => m.key === config.meta.productWarehouse) || null,
      };
    } catch (e) {
      wcError = e.message;
    }
    res.json({ wpProductId: wpId, configKey: config.meta.productWarehouse, local, wc, wcError });
  } catch (err) {
    next(err);
  }
});

// Endpoint de diagnóstico: para cada item de un pedido, reporta si tiene
// thumbnailUrl, si se puede fetchear, qué content-type y tamaño tiene, y si
// es JPEG/PNG. Útil para entender por qué las fotos aparecen vacías en el PDF.
router.get('/:id/debug-images', requireCap(WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');

    const results = [];
    for (const it of order.items) {
      const url = it.product?.thumbnailUrl;
      const row = {
        sku: it.product?.sku || null,
        name: it.product?.name || null,
        thumbnailUrl: url || null,
      };
      if (!url) {
        row.error = 'thumbnailUrl es null en BD (probable: producto sin imagen en WC o sync no la capturó)';
      } else {
        try {
          const r = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 8000,
            headers: { Accept: 'image/jpeg, image/png, image/*;q=0.8', 'User-Agent': 'WMS-Debug/1.0' },
            validateStatus: () => true,
          });
          const buf = Buffer.from(r.data);
          row.httpStatus = r.status;
          row.contentType = r.headers['content-type'] || null;
          row.sizeBytes = buf.length;
          row.firstBytesHex = buf.slice(0, 8).toString('hex');
          row.isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
          row.isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
          row.pdfkitCompatible = row.isPng || row.isJpeg;
        } catch (e) {
          row.error = e.message;
        }
      }
      results.push(row);
    }
    res.json({ orderId: order.id, number: order.number, items: results });
  } catch (err) {
    next(err);
  }
});

// Actualiza la cantidad de bultos esperados de un pedido (post-empaque).
// Útil cuando el picker se da cuenta al armar las bolsas que necesita más
// bultos de los que declaró al cerrar; desde la UI llama a este endpoint y
// luego reimprime los N albaranes pre-numerados.
router.put('/:id/bags', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateBagsSchema.safeParse(req.body || {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());

    const order = await prisma.order.findUnique({ where: { id }, select: { id: true, bagsExpected: true } });
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.bagsExpected === parsed.data.bagsExpected) {
      return res.json({ ok: true, bagsExpected: order.bagsExpected, changed: false });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { bagsExpected: parsed.data.bagsExpected },
      }),
      prisma.event.create({
        data: {
          type: 'order.bags_updated',
          actorId: req.user.wpUserId,
          orderId: id,
          payload: { from: order.bagsExpected, to: parsed.data.bagsExpected },
        },
      }),
    ]);

    res.json({ ok: true, bagsExpected: parsed.data.bagsExpected, changed: true });
  } catch (err) {
    next(err);
  }
});

// Genera el albarán imprimible (PDF A4) con QR y, si corresponde,
// marca grande de "Bodega 2 pendiente" + listado de items B2.
// Si el pedido tiene bagsExpected > 1 (o se manda ?bags=N en la query, que
// tiene precedencia para "previsualizar"), se generan N páginas, cada una
// rotulada "BULTO X DE N" arriba.
router.get('/:id/albaran.pdf', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, 'Order not found');

    // ?bags=N permite previsualizar/forzar otro número de bultos sin tocar
    // el pedido (ej: el picker está decidiendo entre 2 y 3). Si no viene,
    // usa el bagsExpected guardado en el pedido.
    let bagsOverride = null;
    if (req.query.bags != null) {
      const n = Number(req.query.bags);
      if (!Number.isFinite(n) || n < 1 || n > 20) {
        throw new HttpError(400, 'Invalid bags param (must be 1..20)');
      }
      bagsOverride = n;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="albaran-${order.number}.pdf"`);
    await renderAlbaranPdf(order, res, { bagsOverride });
  } catch (err) {
    next(err);
  }
});

export default router;
