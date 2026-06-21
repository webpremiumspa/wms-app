import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

// Crea un proceso nuevo. Restricción de negocio: solo puede haber 1 proceso
// abierto a la vez. Si ya hay uno open, falla con 409.
export async function createProcess({ name, scheduledAt, actorId }) {
  const existingOpen = await prisma.deliveryProcess.findFirst({
    where: { status: 'open' },
    select: { id: true, name: true },
  });
  if (existingOpen) {
    throw new HttpError(409, `Ya hay un proceso abierto (#${existingOpen.id} ${existingOpen.name}). Cerralo antes de crear uno nuevo.`, {
      activeProcessId: existingOpen.id,
    });
  }
  return prisma.deliveryProcess.create({
    data: {
      name: name.trim(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdById: actorId,
    },
    include: {
      createdBy: { select: { wpUserId: true, displayName: true, username: true } },
    },
  });
}

// Cierra un proceso. Manual desde supervisión, o auto cuando todos sus
// pedidos están loaded/delivered (ese caso lo dispara order-actions).
export async function closeProcess({ processId, actorId }) {
  const process = await prisma.deliveryProcess.findUnique({
    where: { id: processId },
  });
  if (!process) throw new HttpError(404, 'Process not found');
  if (process.status === 'closed') {
    return { ok: true, alreadyClosed: true };
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.deliveryProcess.update({
      where: { id: processId },
      data: { status: 'closed', closedAt: now },
    }),
    prisma.event.create({
      data: { type: 'process.closed', actorId, payload: { processId } },
    }),
  ]);
  return { ok: true };
}

// Devuelve el proceso abierto actual (o null si no hay ninguno).
export async function getActiveProcess() {
  return prisma.deliveryProcess.findFirst({
    where: { status: 'open' },
    include: {
      createdBy: { select: { wpUserId: true, displayName: true, username: true } },
      _count: { select: { sequences: true } },
    },
  });
}

// Auto-cierre del proceso cuando todos sus pedidos están loaded/delivered.
// Lo invocan los servicios que cambian status de pedido (dispatch.loaded).
export async function maybeAutoCloseProcess({ processId, actorId }) {
  if (!processId) return null;
  const pending = await prisma.order.count({
    where: {
      sequenceLinks: { some: { sequence: { processId } } },
      status: { notIn: ['loaded', 'delivered', 'blocked'] },
    },
  });
  if (pending > 0) return null;

  const process = await prisma.deliveryProcess.findUnique({
    where: { id: processId },
    select: { status: true },
  });
  if (!process || process.status === 'closed') return null;

  return closeProcess({ processId, actorId });
}

// Lista procesos con paginación simple. Incluye contador de secuencias.
export async function listProcesses({ limit = 50 } = {}) {
  return prisma.deliveryProcess.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      createdBy: { select: { wpUserId: true, displayName: true, username: true } },
      _count: { select: { sequences: true } },
    },
  });
}
