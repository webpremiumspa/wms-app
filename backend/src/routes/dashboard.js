import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCap, WMS_CAPS } from '../middleware/capabilities.js';
import { prisma } from '../db/prisma.js';

const router = Router();
router.use(requireAuth);
router.use(requireCap(WMS_CAPS.SUPERVISE));

const ACTIVE_STATUSES = ['received', 'sequenced', 'picked', 'packed', 'classified', 'loaded'];

router.get('/summary', async (_req, res, next) => {
  try {
    // ─── Pedidos: conteo global y por estado ────────────────────────────────
    const statusGroups = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const byStatus = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));
    const total = Object.values(byStatus).reduce((s, n) => s + n, 0);
    const activeTotal = ACTIVE_STATUSES.reduce((s, st) => s + (byStatus[st] || 0), 0);

    const withB2Pending = await prisma.order.count({
      where: { hasB2Pending: true, status: { in: ACTIVE_STATUSES } },
    });

    // ─── Secuencias ─────────────────────────────────────────────────────────
    const seqOpen = await prisma.sequence.count({ where: { status: 'open' } });
    const seqClosed = await prisma.sequence.count({ where: { status: 'closed' } });

    // ─── Picking B2 del día (agregado por SKU) ──────────────────────────────
    const b2Items = await prisma.orderItem.findMany({
      where: { warehouse: 'B2', order: { status: { in: ACTIVE_STATUSES } } },
      select: { productId: true, pickedAt: true },
    });
    const b2ByProduct = new Map();
    for (const it of b2Items) {
      const g = b2ByProduct.get(it.productId) || { total: 0, picked: 0 };
      g.total += 1;
      if (it.pickedAt) g.picked += 1;
      b2ByProduct.set(it.productId, g);
    }
    const b2TotalSkus = b2ByProduct.size;
    const b2PickedSkus = Array.from(b2ByProduct.values()).filter((g) => g.picked === g.total).length;

    // ─── Por ruta (clasificados / cargados / con B2) ─────────────────────────
    const ordersByRoute = await prisma.order.findMany({
      where: { route: { not: null }, status: { in: ['packed', 'classified', 'loaded'] } },
      select: { route: true, status: true, hasB2Pending: true },
    });
    const routeMap = new Map();
    for (const o of ordersByRoute) {
      const r = routeMap.get(o.route) || { route: o.route, total: 0, classified: 0, loaded: 0, b2: 0 };
      r.total += 1;
      if (o.status === 'classified' || o.status === 'loaded') r.classified += 1;
      if (o.status === 'loaded') r.loaded += 1;
      if (o.hasB2Pending) r.b2 += 1;
      routeMap.set(o.route, r);
    }
    const byRoute = Array.from(routeMap.values()).sort((a, b) => a.route.localeCompare(b.route));

    // ─── Alertas ────────────────────────────────────────────────────────────
    const alerts = [];
    const unsequenced = byStatus.received || 0;
    if (unsequenced >= 20) {
      alerts.push({
        severity: 'warning',
        type: 'high_unsequenced',
        message: `${unsequenced} pedidos sin asignar a secuencia.`,
      });
    }

    const oldOpenSequences = await prisma.sequence.findMany({
      where: { status: 'open', createdAt: { lt: new Date(Date.now() - 4 * 60 * 60 * 1000) } },
      select: { id: true, createdAt: true, warehouse: true },
    });
    for (const s of oldOpenSequences) {
      const hours = Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 3600000);
      alerts.push({
        severity: 'warning',
        type: 'sequence_old',
        message: `Secuencia #${s.id} (${s.warehouse}) abierta hace ${hours}h sin cerrar.`,
      });
    }

    const packedNoRoute = await prisma.order.count({
      where: { status: 'packed', route: null },
    });
    if (packedNoRoute > 0) {
      alerts.push({
        severity: 'info',
        type: 'packed_no_route',
        message: `${packedNoRoute} pedidos empacados sin ruta asignada todavía.`,
      });
    }

    if (b2TotalSkus > 0 && b2PickedSkus < b2TotalSkus) {
      const pending = b2TotalSkus - b2PickedSkus;
      alerts.push({
        severity: pending > 5 ? 'warning' : 'info',
        type: 'b2_pending',
        message: `${pending} SKUs de Bodega 2 sin recolectar.`,
      });
    }

    // ─── Actividad reciente (últimos 15 eventos) ────────────────────────────
    const recentEvents = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        actor: { select: { displayName: true, username: true } },
        order: { select: { number: true } },
      },
    });

    res.json({
      generatedAt: new Date().toISOString(),
      orders: { total, byStatus, activeTotal, withB2Pending },
      sequences: { open: seqOpen, closed: seqClosed },
      pickingB2: { totalSkus: b2TotalSkus, pickedSkus: b2PickedSkus },
      byRoute,
      alerts,
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        type: e.type,
        actor: e.actor?.displayName || e.actor?.username || null,
        orderNumber: e.order?.number || null,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
