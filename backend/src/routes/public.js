import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';
import { getOrderLoadability } from '../services/order-actions.js';
import { getBagEventsFor } from '../services/bag-events.js';
import { getPackPlanFor } from '../services/pack-plan.js';

const router = Router();

// Endpoints públicos (sin auth). Pensados para el scan del QR del albarán
// desde la cámara del móvil, sin obligar al repartidor a loguearse cada vez.
// Solo retornan datos necesarios para la entrega; las acciones de modificación
// (mark loaded, etc.) siguen requiriendo auth.
router.get('/orders/:wpOrderId', async (req, res, next) => {
  try {
    const wpOrderId = Number(req.params.wpOrderId);
    if (!wpOrderId) throw new HttpError(400, 'Invalid wpOrderId');
    const order = await prisma.order.findUnique({
      where: { wpOrderId },
      include: {
        items: { include: { product: true } },
        sequenceLinks: { include: { sequence: { select: { id: true, status: true, processId: true } } } },
      },
    });
    if (!order) throw new HttpError(404, `Pedido ${wpOrderId} no encontrado`);

    // Indica si el pedido es "empacable" (está en una secuencia abierta y en
    // estado sequenced). El frontend usa esto para mostrar el botón "Empacar
    // este pedido" después de escanear el QR del albarán.
    const openSequence = order.sequenceLinks
      .map((l) => l.sequence)
      .find((s) => s.status === 'open');
    const openSequenceId = openSequence?.id || null;
    // v0.25.8: procesId del pedido activo para poder filtrar la vista
    // /dispatch/today al proceso actual — evita que aparezcan rutas de
    // procesos cerrados de días anteriores en la lista de progreso.
    const openProcessId = openSequence?.processId || null;
    const packable = order.status === 'sequenced' && openSequenceId != null;
    // Indica si el pedido necesita picking B2 (tiene items B2, no está cerrado
    // B2 todavía, y está en un estado activo). El picker B2 escanea el QR y
    // entra a esta vista.
    const b2Pickable = order.hasB2Pending
      && order.b2ClosedAt == null
      && openSequenceId != null
      && !['blocked', 'delivered'].includes(order.status);

    // Loadability: para que la UI de scan post-packing pueda mostrar el
    // bloqueo B2 o el banner de entrega parcial. Se incluye en la respuesta
    // pública porque cualquiera con el albarán físico ya conoce los items.
    const loadability = await getOrderLoadability(order.id);

    // Progreso de bultos: para pedidos multi-bulto, cuáles ya fueron
    // clasificados y cuáles ya fueron cargados. La UI de scan usa esto para
    // mostrar "1/3 clasificados", pintar el bulto activo, etc.
    const bagProgress = await getBagEventsFor(order.id);
    // Pack plan (v0.24.0): distribución de items por bulto en el empaque.
    // Necesario para que la vista scan detecte si el pedido está en modo
    // pack-por-bulto.
    const packPlan = await getPackPlanFor(order.id);

    // Progreso de la secuencia abierta del pedido: para que la vista de scan
    // (clasificación / carga) muestre un warning suave si aún hay pedidos
    // pendientes en la misma fase anterior. Excluimos pedidos bloqueados.
    let sequenceProgress = null;
    if (openSequenceId) {
      const peers = await prisma.order.findMany({
        where: {
          sequenceLinks: { some: { sequenceId: openSequenceId } },
          status: { notIn: ['blocked'] },
        },
        select: { id: true, status: true },
      });
      const isPacked = (s) => ['packed', 'classified', 'loaded', 'delivered'].includes(s);
      const isClassified = (s) => ['classified', 'loaded', 'delivered'].includes(s);
      const total = peers.length;
      const packedCount = peers.filter((o) => isPacked(o.status)).length;
      const classifiedCount = peers.filter((o) => isClassified(o.status)).length;
      sequenceProgress = {
        sequenceId: openSequenceId,
        totalActive: total,
        packedCount,
        classifiedCount,
        pendingPack: total - packedCount,
        pendingClassify: packedCount - classifiedCount,
      };
    }

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
        hasB2Pending: order.hasB2Pending,
        // v0.25.9: estado de entrega derivado de metas WDG.
        deliveryStatus: order.deliveryStatus,
        deliveryMeta: order.deliveryMeta,
        allowPartialDelivery: order.allowPartialDelivery,
        partialDeliveryNote: order.partialDeliveryNote,
        bagsExpected: order.bagsExpected,
        bagsClassified: bagProgress.classified,
        bagsLoaded: bagProgress.loaded,
        packPlan,
        classifiedAt: order.classifiedAt,
        loadedAt: order.loadedAt,
        packable,
        b2Pickable,
        openSequenceId,
        openProcessId,
        loadable: loadability.loadable,
        partialApproved: loadability.partialApproved,
        missingB2Items: loadability.missingB2Items || [],
        blockReason: loadability.reason || null,
        sequenceProgress,
        items: order.items.map((it) => ({
          id: it.id,
          qty: it.qty,
          warehouse: it.warehouse,
          lineName: it.lineName,
          product: {
            sku: it.product?.sku,
            name: it.product?.name,
            thumbnailUrl: it.product?.thumbnailUrl,
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
