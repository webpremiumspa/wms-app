import { Router } from 'express';
import { prisma } from '../db/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = { status: 'ok', db: 'ok', ts: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    result.db = 'down';
    result.dbError = err?.message || String(err);
    result.dbCode = err?.code || err?.errorCode || null;
  }
  res.json(result);
});

export default router;
