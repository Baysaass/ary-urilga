import type { Blessing, BlessingStatus, SymbolicGift } from '../types';

export type Reaction = 'heart' | 'sparkle' | 'pray';
export const SYMBOLIC_GIFTS: SymbolicGift[] = [
  { id: 'love', icon: '❤️', label: 'Хайр', count: 0, color: '#C86D51' },
  { id: 'fortune', icon: '✨', label: 'Аз хийморь', count: 0, color: '#B49368' },
  { id: 'growth', icon: '🌱', label: 'Өсөлт', count: 0, color: '#7E9276' },
  { id: 'joy', icon: '😂', label: 'Инээд хөөр', count: 0, color: '#D49D6A' },
  { id: 'peace', icon: '🕊️', label: 'Амар амгалан', count: 0, color: '#8898A5' },
  { id: 'abundance', icon: '💰', label: 'Элбэг дэлбэг', count: 0, color: '#C9A35D' },
];

export interface GuestSnapshot {
  revision: number;
  blessings: Blessing[];
  gifts: SymbolicGift[];
  selectedGifts: string[];
  reactions: Record<string, Reaction>;
}

let snapshot: GuestSnapshot = { revision: -1, blessings: [], gifts: SYMBOLIC_GIFTS, selectedGifts: [], reactions: {} };
const listeners = new Set<() => void>();
let openingSession: Promise<void> | undefined;

function applySnapshot(next: GuestSnapshot) {
  if (next.revision < snapshot.revision) return;
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
  snapshot = next;
  listeners.forEach(listener => listener());
}

async function request(path: string, body?: unknown, method = 'POST') {
  const response = await fetch(`/api/invitation${path}`, {
    method: body === undefined ? 'GET' : method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Холболт тасарлаа. Дахин оролдоно уу.');
  return data;
}

export function subscribeGuestData(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export async function refreshGuestData() { applySnapshot(await request('')); }
export function openGuestSession(): Promise<void> {
  if (!openingSession) {
    openingSession = request('/open', {}).then(applySnapshot).catch(error => {
      openingSession = undefined;
      throw error;
    });
  }
  return openingSession;
}
export function getBlessings(status?: BlessingStatus) {
  return status ? snapshot.blessings.filter(b => b.status === status) : snapshot.blessings;
}
export function getPublicBlessings() { return getBlessings('approved'); }
export function getSymbolicGifts() { return snapshot.gifts; }
export function getSelectedGifts() { return snapshot.selectedGifts; }
export function getSelectedReaction(id: string) { return snapshot.reactions[id]; }

export async function addBlessing(payload: { guest_name: string; message: string; anonymous?: boolean }) {
  await openGuestSession();
  applySnapshot(await request('/blessings', { guest_name: payload.guest_name, message: payload.message }));
}
export async function incrementSymbolicGift(id: string) {
  await openGuestSession();
  applySnapshot(await request('/gifts', { id }));
}
export async function reactToBlessing(id: string, type: Reaction) {
  await openGuestSession();
  applySnapshot(await request('/reactions', { id, type }));
}
export async function loginHost(pin: string) {
  applySnapshot(await request('/host/login', { pin }));
}
export async function updateBlessingStatus(id: string, status: BlessingStatus) {
  applySnapshot(await request(`/host/blessings/${id}`, { status }, 'PATCH'));
}
export async function updateBlessingContent(id: string, updates: Partial<Blessing>) {
  applySnapshot(await request(`/host/blessings/${id}`, { message: updates.message }, 'PATCH'));
}
export async function deleteBlessing(id: string) {
  applySnapshot(await request(`/host/blessings/${id}`, {}, 'DELETE'));
}
export async function resetGuestData() {
  applySnapshot(await request('/host/reset', {}));
}
