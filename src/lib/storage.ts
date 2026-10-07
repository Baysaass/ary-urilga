import { EventConfig, RSVP, Blessing, SymbolicGift, TimelineItem, GalleryPhoto } from '../types';
import { resetGuestData } from './guest-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  EVENT_CONFIG: 'mhw_event_config_v3',
  RSVPS: 'mhw_rsvps_v1',
  BLESSINGS: 'mhw_blessings_v1',
  SYMBOLIC: 'mhw_symbolic_v1',
  TIMELINE: 'mhw_timeline_v1',
  GALLERY: 'mhw_gallery_v1',
  USER_REACTIONS: 'mhw_user_reactions_v1',
  USER_SYMBOLIC: 'mhw_user_symbolic_v1',
};

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  hosts: 'Батдорж & Ариунбаяр',
  inviteeKicker: 'таныг',
  title: 'Шинэ гэрийн цайллагад',
  subtitle: 'хүндэтгэн урьж байна.',
  year: 2026,
  month: 10,
  day: 9,
  timeRange: '',
  timeStartTime: '',
  timeEndTime: '',
  locationCity: 'Даланзадгад',
  locationDistrict: '3-р баг',
  locationAddress: '34-р байр, 3 давхарт, 10 тоот',
  googleMapsUrl: 'https://maps.app.goo.gl/7k28f1YBfnej28zEA',
  introQuote: 'Шинэ гэр, шинэ дурсамж, шинэ эхлэл.',
  introSubtext: 'Шинэ гэрийнхээ босгыг мялааж, баярт мөчөө та бүхэнтэйгээ хуваалцахыг хүсэж байна.',
  closingQuote: 'Шинэ гэрийг эд зүйлс биш,\nхамтдаа бүтээсэн дурсамж, инээд хөөр, сайхан ерөөл гэр болгодог.',
};

export const DEFAULT_BLESSINGS: Blessing[] = [];
export const DEFAULT_RSVPS: RSVP[] = [];

export { SYMBOLIC_GIFTS as DEFAULT_SYMBOLIC_GIFTS } from './guest-data';

export const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    id: 't-1',
    time: '15:00',
    title: 'Зочдоо угтах',
    description: 'Халуун дотно угталт, тавтай морилно уу ундаа, амтат зууш',
  },
  {
    id: 't-2',
    time: '16:00',
    title: 'Цай, зоог & хүндэтгэл',
    description: 'Монгол уламжлалт цайны ёслол, амтат зоог, шинэ гэрийн танилцуулга',
  },
  {
    id: 't-3',
    time: '17:00',
    title: 'Шинэ гэрийн ерөөл, мялаалга',
    description: 'Гал голомтын мялаалга, эрхэм зочдын сэтгэлийн ерөөл, талархал',
  },
  {
    id: 't-4',
    time: '18:00',
    title: 'Дурсгалын зураг татуулах',
    description: 'Шинэ гэрийн нандин дурсамжийг гэрэл зурагт мөнхлөх мөч',
  },
  {
    id: 't-5',
    time: '19:00',
    title: 'Халуун яриа, чөлөөт цаг',
    description: 'Хөгжим, дулаан яриа, баярын амтат бялуу хуваалцах',
  },
];

export const DEFAULT_GALLERY: GalleryPhoto[] = [
  {
    id: 'g-1',
    title: 'Шинэ өглөө, шинэ гэрэл',
    caption: 'Нарны дулаан туяа манай шинэ гэрийн цонхоор орж ирэх анхны өглөө.',
    aspect: 'portrait',
    imageUrl: '',
  },
  {
    id: 'g-2',
    title: 'Амтат цайны ширээ',
    caption: 'Зочдоо хүлээн авах халуун цай, чихэр жимс, сэтгэлийн бэлтгэл.',
    aspect: 'landscape',
    imageUrl: '',
  },
  {
    id: 'g-3',
    title: 'Энх амгалангийн булаг',
    caption: 'Хамтдаа урласан тав тухтай орчин, гэр бүлийн дулаан мөч.',
    aspect: 'portrait',
    imageUrl: '',
  },
];

let rsvpMemoryCache: RSVP[] = [];
let rsvpRealtimeInit = false;
const rsvpListeners = new Set<() => void>();

export function subscribeRsvps(listener: () => void) {
  rsvpListeners.add(listener);
  return () => { rsvpListeners.delete(listener); };
}

function notifyRsvpListeners() {
  rsvpListeners.forEach(listener => listener());
}

export function getEventConfig(): EventConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENT_CONFIG);
    if (data) return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(data) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_EVENT_CONFIG;
}

export function saveEventConfig(config: EventConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
    if (isSupabaseConfigured() && supabase) {
      void supabase.from('event_config').upsert({
        id: 'main',
        hosts: config.hosts,
        title: config.title,
        subtitle: config.subtitle,
        year: config.year,
        month: config.month,
        day: config.day,
        time_range: config.timeRange,
        location_city: config.locationCity,
        location_district: config.locationDistrict,
        location_address: config.locationAddress,
        google_maps_url: config.googleMapsUrl,
        intro_quote: config.introQuote,
        intro_subtext: config.introSubtext,
        closing_quote: config.closingQuote,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function syncEventConfigFromSupabase(): Promise<EventConfig | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data } = await supabase.from('event_config').select('*').eq('id', 'main').single();
    if (data) {
      const cfg: EventConfig = {
        ...DEFAULT_EVENT_CONFIG,
        hosts: data.hosts || DEFAULT_EVENT_CONFIG.hosts,
        title: data.title || DEFAULT_EVENT_CONFIG.title,
        subtitle: data.subtitle || DEFAULT_EVENT_CONFIG.subtitle,
        year: data.year || DEFAULT_EVENT_CONFIG.year,
        month: data.month || DEFAULT_EVENT_CONFIG.month,
        day: data.day || DEFAULT_EVENT_CONFIG.day,
        timeRange: data.time_range || DEFAULT_EVENT_CONFIG.timeRange,
        locationCity: data.location_city || DEFAULT_EVENT_CONFIG.locationCity,
        locationDistrict: data.location_district || DEFAULT_EVENT_CONFIG.locationDistrict,
        locationAddress: data.location_address || DEFAULT_EVENT_CONFIG.locationAddress,
        googleMapsUrl: data.google_maps_url || DEFAULT_EVENT_CONFIG.googleMapsUrl,
        introQuote: data.intro_quote || DEFAULT_EVENT_CONFIG.introQuote,
        introSubtext: data.intro_subtext || DEFAULT_EVENT_CONFIG.introSubtext,
        closingQuote: data.closing_quote || DEFAULT_EVENT_CONFIG.closingQuote,
      };
      localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(cfg));
      return cfg;
    }
  } catch (err) {
    console.warn('Failed to sync event config from Supabase:', err);
  }
  return null;
}

export function getRsvps(): RSVP[] {
  if (rsvpMemoryCache.length > 0) {
    return rsvpMemoryCache;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RSVPS);
    if (data) {
      const parsed = JSON.parse(data);
      rsvpMemoryCache = parsed;
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_RSVPS;
}

export function saveRsvps(rsvps: RSVP[]): void {
  rsvpMemoryCache = rsvps;
  try {
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
  } catch (e) {
    console.error(e);
  }
  notifyRsvpListeners();
}

export async function syncRsvpsFromSupabase(): Promise<RSVP[]> {
  if (!isSupabaseConfigured() || !supabase) return getRsvps();

  if (!rsvpRealtimeInit) {
    rsvpRealtimeInit = true;
    try {
      supabase
        .channel('rsvps_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
          void syncRsvpsFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('RSVP realtime subscription error:', err);
    }
  }

  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch RSVPs from Supabase:', error.message);
      return getRsvps();
    }

    const fetchedRsvps: RSVP[] = (data || []).map(r => ({
      id: r.id,
      guest_name: r.guest_name,
      attending: r.attending as 'yes' | 'no',
      guest_count: r.guest_count,
      arrival_time: r.arrival_time || '',
      phone_or_note: r.phone_or_note || '',
      created_at: r.created_at,
    }));

    saveRsvps(fetchedRsvps);
    return fetchedRsvps;
  } catch (err) {
    console.warn('Error syncing RSVPs:', err);
    return getRsvps();
  }
}

export async function addRsvp(rsvp: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
  const newItem: RSVP = {
    ...rsvp,
    id: 'rsvp-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('rsvps').insert({
      guest_name: rsvp.guest_name,
      attending: rsvp.attending,
      guest_count: rsvp.guest_count,
      arrival_time: rsvp.arrival_time,
      phone_or_note: rsvp.phone_or_note,
    }).select().single();

    if (!error && data) {
      newItem.id = data.id;
      newItem.created_at = data.created_at;
    }
  }

  const all = getRsvps();
  const updated = [newItem, ...all.filter(r => r.id !== newItem.id)];
  saveRsvps(updated);
  return newItem;
}

export {
  getBlessings, getPublicBlessings, addBlessing, updateBlessingStatus,
  updateBlessingContent, deleteBlessing, reactToBlessing,
  getSymbolicGifts, incrementSymbolicGift,
} from './guest-data';

export function getTimeline(): TimelineItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_TIMELINE;
}

export function saveTimeline(items: TimelineItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(items));
  } catch (e) {
    console.error(e);
  }
}

export function getGallery(): GalleryPhoto[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_GALLERY;
}

export function saveGallery(items: GalleryPhoto[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
  } catch (e) {
    console.error(e);
  }
}

export async function resetAllToDefaults(): Promise<void> {
  await resetGuestData();
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('rsvps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
  rsvpMemoryCache = [];
  localStorage.removeItem(STORAGE_KEYS.EVENT_CONFIG);
  localStorage.removeItem('mhw_event_config_v2');
  localStorage.removeItem('mhw_event_config_v1');
  localStorage.removeItem(STORAGE_KEYS.RSVPS);
  localStorage.removeItem(STORAGE_KEYS.BLESSINGS);
  localStorage.removeItem(STORAGE_KEYS.SYMBOLIC);
  localStorage.removeItem(STORAGE_KEYS.TIMELINE);
  localStorage.removeItem(STORAGE_KEYS.GALLERY);
  notifyRsvpListeners();
}
