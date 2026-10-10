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
  day: 23,
  day2: 24,
  timeRange: '15:00 цагаас',
  timeStartTime: '',
  timeEndTime: '',
  locationCity: 'Даланзадгад',
  locationDistrict: '3-р баг',
  locationAddress: '34-р байр, 3 давхарт, 10 тоот',
  introQuote: 'Ургах нарыг угтан сүндэрлэсэн\nУраг төрөл батжин дэлгэрсэн\nЭцэг өвгөдийнхөө голомтыг\nөргөтгөн тэлж буй бидний',
  introSubtext: 'Шинэ байшингийн цайллаганд хүрэлцэн ирэхийг урьж байна.',
  closingQuote: 'Бидний баяр жаргалыг хуваалцаж, шинэ өргөөний гал голомтыг мялаахаар морилон ирэх эрхэм танд болон танай гэр бүлд чин сэтгэлийн гүн талархал илэрхийлье.\n\nТа бүхний минь гишгэсэн газар бүхэнд өлзий хутаг оршиж, айл гэр тань аз жаргал, сайн сайхан бүхнээр үргэлж бялхаж явах болтугай.',
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
    if (data) {
      const parsed = JSON.parse(data);
      // Sanitize stale config: if day is 9 or missing, force October 23, 2026
      const day = (!parsed.day || parsed.day === 9) ? 23 : parsed.day;
      const day2 = !parsed.day2 ? 24 : parsed.day2;
      const month = (!parsed.month || parsed.month === 9) ? 10 : parsed.month;
      const year = parsed.year || 2026;
      const closingQuote = (!parsed.closingQuote || parsed.closingQuote.includes('эд зүйлс'))
        ? DEFAULT_EVENT_CONFIG.closingQuote
        : parsed.closingQuote;
      const introQuote = (!parsed.introQuote || parsed.introQuote.includes('Шинэ гэр, шинэ дурсамж'))
        ? DEFAULT_EVENT_CONFIG.introQuote
        : parsed.introQuote;
      const introSubtext = (!parsed.introSubtext || parsed.introSubtext.includes('босгыг мялааж'))
        ? DEFAULT_EVENT_CONFIG.introSubtext
        : parsed.introSubtext;
      return {
        ...DEFAULT_EVENT_CONFIG,
        ...parsed,
        day,
        day2,
        month,
        year,
        introQuote,
        introSubtext,
        closingQuote,
      };
    }
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
        day2: config.day2 || 24,
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
      // Sanitize any stale day=9 or month=9 in Supabase
      const day = (!data.day || data.day === 9) ? 23 : data.day;
      const day2 = !data.day2 ? 24 : data.day2;
      const month = (!data.month || data.month === 9) ? 10 : data.month;
      const cfg: EventConfig = {
        ...DEFAULT_EVENT_CONFIG,
        hosts: data.hosts || DEFAULT_EVENT_CONFIG.hosts,
        title: data.title || DEFAULT_EVENT_CONFIG.title,
        subtitle: data.subtitle || DEFAULT_EVENT_CONFIG.subtitle,
        year: data.year || DEFAULT_EVENT_CONFIG.year,
        month,
        day,
        day2,
        timeRange: data.time_range !== undefined ? data.time_range : DEFAULT_EVENT_CONFIG.timeRange,
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
      adults: typeof r.adults === 'number' ? r.adults : (r.attending === 'no' ? 0 : Math.max(1, r.guest_count || 1)),
      children: typeof r.children === 'number' ? r.children : 0,
      arrival_time: r.arrival_time || '',
      phone_or_note: r.phone_or_note || '',
      event_day: r.event_day || '10-23',
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
  const isNo = rsvp.attending === 'no';
  const adults = isNo ? 0 : (rsvp.adults !== undefined ? rsvp.adults : Math.max(1, rsvp.guest_count || 1));
  const children = isNo ? 0 : (rsvp.children !== undefined ? rsvp.children : 0);
  const totalCount = isNo ? 0 : (adults + children);

  const newItem: RSVP = {
    ...rsvp,
    adults,
    children,
    guest_count: totalCount,
    event_day: rsvp.event_day || '10-23',
    id: 'rsvp-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const dbAttending = isNo ? 'no' : 'yes';
      const basePayload: Record<string, unknown> = {
        guest_name: rsvp.guest_name,
        attending: dbAttending,
        guest_count: totalCount,
        arrival_time: rsvp.arrival_time || '',
        phone_or_note: rsvp.phone_or_note || '',
        event_day: newItem.event_day,
      };

      // Try inserting with adults/children first
      const { data, error } = await supabase.from('rsvps').insert({
        ...basePayload,
        adults,
        children,
      }).select().single();

      if (!error && data) {
        newItem.id = data.id;
        newItem.created_at = data.created_at;
      } else {
        // Fallback without adults/children in case columns don't exist yet in Supabase
        const { data: fallbackData } = await supabase.from('rsvps').insert(basePayload).select().single();
        if (fallbackData) {
          newItem.id = fallbackData.id;
          newItem.created_at = fallbackData.created_at;
        }
      }
    } catch (err) {
      console.warn('Failed to insert RSVP to Supabase:', err);
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
