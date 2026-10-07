import type { Blessing, BlessingStatus, SymbolicGift } from '../types';
import { supabase, isSupabaseConfigured, getGuestDeviceId } from './supabase';

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

let snapshot: GuestSnapshot = {
  revision: 0,
  blessings: [],
  gifts: SYMBOLIC_GIFTS.map(g => ({ ...g, count: 0 })),
  selectedGifts: [],
  reactions: {},
};

const listeners = new Set<() => void>();
let realtimeSubscribed = false;

function applySnapshot(next: GuestSnapshot) {
  snapshot = next;
  listeners.forEach(listener => listener());
}

async function requestLocalApi(path: string, body?: unknown, method = 'POST') {
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

/**
 * Fetch latest data from Supabase
 */
async function fetchSupabaseSnapshot(): Promise<GuestSnapshot> {
  if (!supabase) return snapshot;

  const guestId = getGuestDeviceId();

  // 1. Fetch Blessings
  const { data: blessingsData, error: blessingsError } = await supabase
    .from('blessings')
    .select('*')
    .order('created_at', { ascending: false });

  if (blessingsError) {
    console.warn('Supabase blessings fetch warning:', blessingsError.message);
  }

  // 2. Fetch Reactions
  const { data: reactionsData, error: reactionsError } = await supabase
    .from('blessing_reactions')
    .select('*');

  if (reactionsError) {
    console.warn('Supabase reactions fetch warning:', reactionsError.message);
  }

  // 3. Fetch Guest Gifts
  const { data: giftsData, error: giftsError } = await supabase
    .from('guest_gifts')
    .select('*');

  if (giftsError) {
    console.warn('Supabase gifts fetch warning:', giftsError.message);
  }

  const allReactions = reactionsData || [];
  const allGifts = giftsData || [];

  // Map blessings with calculated reaction counts
  const blessings: Blessing[] = (blessingsData || []).map(b => {
    const cardReactions = allReactions.filter(r => r.blessing_id === b.id);
    return {
      id: b.id,
      guest_name: b.guest_name,
      message: b.message,
      anonymous: Boolean(b.anonymous),
      status: b.status as BlessingStatus,
      reactions: {
        heart: cardReactions.filter(r => r.reaction_type === 'heart').length,
        sparkle: cardReactions.filter(r => r.reaction_type === 'sparkle').length,
        pray: cardReactions.filter(r => r.reaction_type === 'pray').length,
      },
      created_at: b.created_at,
      approved_at: b.approved_at,
    };
  });

  // Calculate gift counts
  const gifts: SymbolicGift[] = SYMBOLIC_GIFTS.map(g => ({
    ...g,
    count: allGifts.filter(item => item.gift_id === g.id).length,
  }));

  // Selected gifts for this specific device
  const selectedGifts = allGifts
    .filter(item => item.guest_id === guestId)
    .map(item => item.gift_id);

  // User reactions for this specific device
  const reactions: Record<string, Reaction> = {};
  allReactions
    .filter(item => item.guest_id === guestId)
    .forEach(item => {
      reactions[item.blessing_id] = item.reaction_type as Reaction;
    });

  return {
    revision: Date.now(),
    blessings,
    gifts,
    selectedGifts,
    reactions,
  };
}

/**
 * Setup Supabase Realtime channel subscription
 */
function initRealtimeIfNeeded() {
  if (realtimeSubscribed || !supabase) return;
  realtimeSubscribed = true;

  try {
    supabase
      .channel('invitation_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blessings' }, () => {
        void refreshGuestData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blessing_reactions' }, () => {
        void refreshGuestData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_gifts' }, () => {
        void refreshGuestData();
      })
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription error:', err);
  }
}

export function subscribeGuestData(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function refreshGuestData() {
  if (isSupabaseConfigured()) {
    initRealtimeIfNeeded();
    const next = await fetchSupabaseSnapshot();
    applySnapshot(next);
  } else {
    try {
      const data = await requestLocalApi('');
      applySnapshot(data);
    } catch {
      // Offline or local development fallback without express backend
      listeners.forEach(listener => listener());
    }
  }
}

export async function openGuestSession(): Promise<void> {
  if (isSupabaseConfigured()) {
    // With Supabase, device ID in localStorage is used.
    getGuestDeviceId();
    initRealtimeIfNeeded();
    return;
  }
  try {
    const data = await requestLocalApi('/open', {});
    applySnapshot(data);
  } catch {
    // Ignore in static mode
  }
}

export function getBlessings(status?: BlessingStatus) {
  return status ? snapshot.blessings.filter(b => b.status === status) : snapshot.blessings;
}

export function getPublicBlessings() {
  return getBlessings('approved');
}

export function getSymbolicGifts() {
  return snapshot.gifts;
}

export function getSelectedGifts() {
  return snapshot.selectedGifts;
}

export function getSelectedReaction(id: string) {
  return snapshot.reactions[id];
}

export async function addBlessing(payload: { guest_name: string; message: string; anonymous?: boolean }) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('blessings').insert({
      guest_name: payload.guest_name.trim(),
      message: payload.message.trim(),
      anonymous: Boolean(payload.anonymous),
      status: 'approved',
    });
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }

  await openGuestSession();
  applySnapshot(await requestLocalApi('/blessings', { guest_name: payload.guest_name, message: payload.message }));
}

export async function incrementSymbolicGift(id: string) {
  if (isSupabaseConfigured() && supabase) {
    const guestId = getGuestDeviceId();
    const { error } = await supabase.from('guest_gifts').upsert({
      guest_id: guestId,
      gift_id: id,
    }, { onConflict: 'guest_id,gift_id' });
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }

  await openGuestSession();
  applySnapshot(await requestLocalApi('/gifts', { id }));
}

export async function reactToBlessing(id: string, type: Reaction) {
  if (isSupabaseConfigured() && supabase) {
    const guestId = getGuestDeviceId();
    const { error } = await supabase.from('blessing_reactions').upsert({
      blessing_id: id,
      guest_id: guestId,
      reaction_type: type,
    }, { onConflict: 'blessing_id,guest_id' });
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }

  await openGuestSession();
  applySnapshot(await requestLocalApi('/reactions', { id, type }));
}

export async function loginHost(pin: string) {
  const expectedPin = import.meta.env.VITE_ADMIN_PIN || '2026';
  if (pin !== expectedPin) {
    if (!isSupabaseConfigured()) {
      applySnapshot(await requestLocalApi('/host/login', { pin }));
      return;
    }
    throw new Error('ПИН код буруу байна.');
  }
  // Store authenticated host in session
  sessionStorage.setItem('mhw_host_auth', 'true');
}

export async function updateBlessingStatus(id: string, status: BlessingStatus) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('blessings').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }
  applySnapshot(await requestLocalApi(`/host/blessings/${id}`, { status }, 'PATCH'));
}

export async function updateBlessingContent(id: string, updates: Partial<Blessing>) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('blessings').update({ message: updates.message }).eq('id', id);
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }
  applySnapshot(await requestLocalApi(`/host/blessings/${id}`, { message: updates.message }, 'PATCH'));
}

export async function deleteBlessing(id: string) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('blessings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await refreshGuestData();
    return;
  }
  applySnapshot(await requestLocalApi(`/host/blessings/${id}`, {}, 'DELETE'));
}

export async function resetGuestData() {
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('blessing_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('guest_gifts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('blessings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await refreshGuestData();
    return;
  }
  applySnapshot(await requestLocalApi('/host/reset', {}));
}
