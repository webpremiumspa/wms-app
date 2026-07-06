import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { HttpError } from '../middleware/error.js';
import { prisma } from '../db/prisma.js';
import {
  createSequence,
  validateStock,
  getPendingPacking,
  closeSequenceB1,
} from '../services/sequences.js';
import { removeOrderFromSequence, REMOVE_REASONS } from '../services/order-actions.js';
import { renderSequenceAlbaranesPdf } from '../services/pdf.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    // Default 50 (vista de lista). La vista de calendario pide ~1000 para
    // poder mostrar varios meses sin paginar.
    const limit = Math.min(Number(req.query.limit) || 50, 1000);
    const sequences = await prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { orders: true } },
        orders: {
          include: {
            order: {
              include: { items: { select: { warehouse: true, pickedAt: true } } },
            },
          },
        },
      },
    });
    // Calculamos progreso B1 y B2 (totales y pendientes) para alimentar la UI.
    const out = sequences.map((s) => {
      const items = s.orders.flatMap((so) => so.order.items);
      const b1 = items.filter((i) => i.warehouse === 'B1');
      const b2 = items.filter((i) => i.warehouse === 'B2');
      return {
        id: s.id,
        status: s.status,
        expectedBags: s.expectedBags,
        actualBags: s.actualBags,
        createdAt: s.createdAt,
        closedAt: s.closedAt,
        b1ClosedAt: s.b1ClosedAt,
        b2ClosedAt: s.b2ClosedAt,
        _count: s._count,
        b1: { total: b1.length, pending: b1.filter((i) => !i.pickedAt).length },
        b2: { total: b2.length, pending: b2.filter((i) => !i.pickedAt).length },
      };
    });
    res.json({ sequences: out });
  } catch (err) {
    next(err);
  }
});

// Eliminar una secuencia. Permite hacerlo siempre que la secuencia esté abierta,
// incluso si algunos pedidos ya pasaron de 'sequenced'. Revierte TODO ese
// progreso (status, timestamps, packer) para que los pedidos vuelvan a estar
// disponibles. Pedidos en 'delivered' se conservan (ya están finalizados por
// el sistema externo).
router.delete('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const seq = await prisma.sequence.findUnique({
      where: { id },
      include: { orders: { include: { order: true } } },
    });
    if (!seq) throw new HttpError(404, 'Sequence not found');

    const orderIds = seq.orders
      .filter((so) => so.order.status !== 'delivered')
      .map((so) => so.orderId);
    const skippedDelivered = seq.orders.filter((so) => so.order.status === 'delivered').length;

    // Contar los bag events que se van a borrar para el evento de auditoría.
    // Sin este borrado, si los pedidos vuelven a entrar a una secuencia y se
    // clasifican/cargan, los eventos viejos arruinarían el conteo (el UNIQUE
    // hace que registrar el mismo bag sea idempotente, así que el 'done' no
    // llega al total real).
    const bagEventsCleared = orderIds.length > 0
      ? await prisma.orderBagEvent.count({ where: { orderId: { in: orderIds } } })
      : 0;

    await prisma.$transaction([
      // Revertir items: limpiar pickedAt y packedAt para los pedidos a resetear
      prisma.orderItem.updateMany({
        where: { orderId: { in: orderIds } },
        data: { pickedAt: null, packedAt: null },
      }),
      // Revertir pedidos al estado 'received' y limpiar timestamps WMS
      prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          status: 'received',
          packedAt: null,
          packedById: null,
          pickedById: null,
          claimedAt: null,
          b2ClosedAt: null,
          b2ClosedById: null,
          classifiedAt: null,
          loadedAt: null,
        },
      }),
      // Bag events: se borran junto con la reversión de status. Ver comentario
      // arriba.
      prisma.orderBagEvent.deleteMany({ where: { orderId: { in: orderIds } } }),
      // Plan de empaque multi-bulto (v0.24.0): al eliminar la secuencia,
      // los pedidos vuelven a 'received' y no deben conservar plan.
      prisma.orderItemBagAssignment.deleteMany({ where: { orderId: { in: orderIds } } }),
      // Borrar la secuencia (cascadea SequenceOrder)
      prisma.sequence.delete({ where: { id } }),
      prisma.event.create({
        data: {
          type: 'sequence.deleted',
          actorId: req.user.wpUserId,
          payload: {
            sequenceId: id,
            ordersReverted: orderIds.length,
            skippedDelivered,
            bagEventsCleared,
          },
        },
      }),
    ]);

    res.json({ ok: true, ordersReverted: orderIds.length, skippedDelivered, bagEventsCleared });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.PACK_B2, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sequence = await prisma.sequence.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            order: {
              include: { items: { select: { warehouse: true, pickedAt: true } } },
            },
          },
        },
        createdBy: { select: { displayName: true, username: true } },
      },
    });
    if (!sequence) throw new HttpError(404, 'Sequence not found');

    // Agregar contadores B1/B2 al payload para que la UI muestre estado de cada flujo.
    const allItems = sequence.orders.flatMap((so) => so.order.items);
    const b1 = allItems.filter((i) => i.warehouse === 'B1');
    const b2 = allItems.filter((i) => i.warehouse === 'B2');
    sequence.b1 = { total: b1.length, pending: b1.filter((i) => !i.pickedAt).length };
    sequence.b2 = { total: b2.length, pending: b2.filter((i) => !i.pickedAt).length };

    // Limpiamos los items inflados para no enviar payload gigante (la UI
    // detalle pide items por pedido aparte).
    sequence.orders = sequence.orders.map((so) => ({
      orderId: so.orderId,
      order: { ...so.order, items: undefined },
    }));

    res.json({ sequence });
  } catch (err) {
    next(err);
  }
});

const validateSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1),
});

router.post('/validate-stock', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const problems = await validateStock(parsed.data.orderIds);
    res.json({ problems });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  orderIds: z.array(z.number().int().positive()).min(1),
  // Opcional. Si se omite y hay un solo proceso abierto, lo deduce.
  // Si hay 2+ abiertos, el backend exige que se especifique.
  processId: z.number().int().positive().optional(),
});

router.post('/', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await createSequence({
      orderIds: parsed.data.orderIds,
      createdById: req.user.wpUserId,
      processId: parsed.data.processId,
    });
    res.status(201).json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pending-packing', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const orders = await getPendingPacking(Number(req.params.id));
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

const closeSchema = z.object({
  actualBags: z.number().int().nonnegative().optional(),
});

// Cierre del flujo B1 (packing terminado). El cierre B2 va por /picking/b2/sequences/:id/close.
router.post('/:id/close-b1', requireCap(WMS_CAPS.PACK_B1), async (req, res, next) => {
  try {
    const parsed = closeSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const seq = await closeSequenceB1({
      sequenceId: Number(req.params.id),
      actorId: req.user.wpUserId,
      actualBags: parsed.data.actualBags,
    });
    res.json({ sequence: seq });
  } catch (err) {
    next(err);
  }
});

// Genera un PDF con TODOS los albaranes de los pedidos vivos de la secuencia,
// uno por página. Los pickers escanean el QR del albarán impreso para empezar
// a empacar el pedido correspondiente.
router.get('/:id/albaranes.pdf', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const seq = await prisma.sequence.findUnique({ where: { id } });
    if (!seq) throw new HttpError(404, 'Sequence not found');

    // Excluimos pedidos ya removidos/bloqueados y los ya entregados.
    const orders = await prisma.order.findMany({
      where: {
        sequenceLinks: { some: { sequenceId: id } },
        status: { in: ['sequenced', 'packed', 'classified', 'loaded'] },
      },
      include: { items: { include: { product: true } } },
      orderBy: { id: 'asc' },
    });

    // Filtro opcional: excluir pedidos sin items B1 (todo el contenido es B2).
    // Estos pedidos no necesitan albarán impreso porque el picker B2 los maneja
    // desde el celular con la app.
    const excludeOnlyB2 = req.query.excludeOnlyB2 === '1' || req.query.excludeOnlyB2 === 'true';
    const filtered = excludeOnlyB2
      ? orders.filter((o) => o.items.some((it) => it.warehouse === 'B1'))
      : orders;

    if (filtered.length === 0) {
      // Distinguir la causa para dar al operador un mensaje procesable:
      //   - Si hay pedidos en la secuencia pero todos son solo B2 y el toggle
      //     los excluyó, decirlo explícitamente para que sepa qué destildar.
      //   - Si no hay ningún pedido imprimible (secuencia vacía o con pedidos
      //     ya entregados/removidos), aclarar que no es un tema del filtro.
      if (excludeOnlyB2 && orders.length > 0) {
        throw new HttpError(
          409,
          `Todos los pedidos de esta secuencia son solo B2 (${orders.length} pedido${orders.length === 1 ? '' : 's'} sin items B1). Desmarca "Excluir pedidos solo B2" para imprimir sus albaranes igual — sirven de comprobante para el conductor.`,
          { reason: 'all_orders_are_b2_only', totalOrders: orders.length },
        );
      }
      throw new HttpError(
        409,
        'No hay pedidos imprimibles en esta secuencia (los pedidos deben estar en secuencia, empacados, clasificados o cargados).',
        { reason: 'no_printable_orders' },
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="secuencia-${id}-albaranes.pdf"`);
    await renderSequenceAlbaranesPdf(filtered, res);
  } catch (err) {
    next(err);
  }
});

const removeOrderSchema = z.object({
  reasonCode: z.enum(REMOVE_REASONS),
  reasonText: z.string().max(500).optional(),
});

// Remueve un pedido individual de la secuencia. El pedido pasa a estado
// 'blocked' para destacarlo del resto. Requiere motivo (auditoría).
router.delete('/:sequenceId/orders/:orderId', requireCap(WMS_CAPS.PACK_B1, WMS_CAPS.SUPERVISE), async (req, res, next) => {
  try {
    const parsed = removeOrderSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new HttpError(400, 'Invalid payload', parsed.error.flatten());
    const result = await removeOrderFromSequence({
      sequenceId: Number(req.params.sequenceId),
      orderId: Number(req.params.orderId),
      reasonCode: parsed.data.reasonCode,
      reasonText: parsed.data.reasonText,
      actorId: req.user.wpUserId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
