import { api } from './api';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type DashboardSummary = {
  generatedAt: string;
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
  summary: async (): Promise<DashboardSummary> => (await api.get('/dashboard/summary')).data,
};
