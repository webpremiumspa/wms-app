const TOKEN_KEY = 'wms.token';
const USER_KEY = 'wms.user';

export type WmsUser = {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  capabilities: Record<string, boolean>;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): WmsUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WmsUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: WmsUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasCap(user: WmsUser | null, cap: string): boolean {
  return Boolean(user?.capabilities?.[cap]);
}

export const CAPS = {
  PICK_B1: 'wms_pick_b1',
  PACK_B1: 'wms_pack_b1',
  PICK_B2: 'wms_pick_b2',
  LOAD: 'wms_load',
  DELIVER: 'wms_deliver',
  SUPERVISE: 'wms_supervise',
} as const;
