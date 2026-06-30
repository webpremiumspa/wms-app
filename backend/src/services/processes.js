import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/error.js';

// Crea un proceso nuevo. No hay tope de procesos abiertos en paralelo: el
// supervisor es quien decide cuántos turnos correr. Antes había un cap rígido
// de 2 (matutino + vespertino) pero la operación necesita más flexibilidad
// para eventos, días puente o procesos express.
export async function createProcess({ name, scheduledAt, actorId }) {
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

// Devuelve el proceso abierto más antiguo (o null). Compat con código viejo
// que asumía un solo proceso abierto a la vez. Para listar todos los abiertos
// usar listOpenProcesses.
export async function getActiveProcess() {
  return prisma.deliveryProcess.findFirst({
    where: { status: 'open' },
    orderBy: { createdAt: 'asc' },
    include: {
      createdBy: { select: { wpUserId: true, displayName: true, username: true } },
      _count: { select: { sequences: true } },
    },
  });
}

// Devuelve todos los procesos abiertos (sin tope de cantidad).
export async function listOpenProcesses() {
  return prisma.deliveryProcess.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'asc' },
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
