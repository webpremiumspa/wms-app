import { api } from './api';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type DashboardSummary = {
  generatedAt: string;
  // Si processId está presente, todos los números están scopeados a ese
  // proceso. Si es null, es el agregado global (modo legacy).
  processId: number | null;
  orders: {
    total: number;
    byStatus: Record<string, number>;
    activeTotal: number;
    withB2Pending: number;
  };
  sequences: { open: number; closed: number };
  pickingB2: { totalSkus: number; pickedSkus: number };
  byRoute: Array<{
    route: string;
    total: number;
    classified: number;
    loaded: number;
    b2: number;
  }>;
  alerts: Array<{
    severity: AlertSeverity;
    type: string;
    message: string;
  }>;
  recentEvents: Array<{
    id: number;
    type: string;
    actor: string | null;
    orderNumber: string | null;
    createdAt: string;
  }>;
};

export const dashboardApi = {
  summary: async (opts?: { processId?: number }): Promise<DashboardSummary> =>
    (await api.get('/dashboard/summary', {
      params: opts?.processId ? { processId: opts.processId } : undefined,
    })).data,
};
