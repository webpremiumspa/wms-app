import { api } from './api';

export type SyncResult = {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ wpOrderId: number; message: string }>;
  orders: Array<{ wpOrderId: number; number: string; status: string }>;
  range: { after: string; before: string | null };
  statuses: string[];
};

export type SyncParams = {
  after?: string; // YYYY-MM-DD o ISO
  before?: string;
  statuses?: string[];
};

export const syncApi = {
  orders: async (params: SyncParams): Promise<SyncResult> =>
    (await api.post('/sync/orders', params)).data,
};
