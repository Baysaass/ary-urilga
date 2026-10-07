import { EventConfig, RSVP, Blessing, SymbolicGift, TimelineItem, GalleryPhoto } from '../types';
import { resetGuestData } from './guest-data';

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

export function getEventConfig(): EventConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENT_CONFIG);
    if (data) return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(data) };
    const previousConfig = localStorage.getItem('mhw_event_config_v2');
    if (previousConfig) {
      return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(previousConfig), hosts: DEFAULT_EVENT_CONFIG.hosts };
    }
    const previous = localStorage.getItem('mhw_event_config_v1');
    if (previous) {
      const old = JSON.parse(previous);
      return { ...DEFAULT_EVENT_CONFIG,
        introQuote: old.introQuote || DEFAULT_EVENT_CONFIG.introQuote,
        introSubtext: old.introSubtext || DEFAULT_EVENT_CONFIG.introSubtext,
        closingQuote: old.closingQuote || DEFAULT_EVENT_CONFIG.closingQuote };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_EVENT_CONFIG;
}

export function saveEventConfig(config: EventConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENT_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error(e);
  }
}

export function getRsvps(): RSVP[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RSVPS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_RSVPS;
}

export function saveRsvps(rsvps: RSVP[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
  } catch (e) {
    console.error(e);
  }
}

export function addRsvp(rsvp: Omit<RSVP, 'id' | 'created_at'>): RSVP {
  const all = getRsvps();
  const newItem: RSVP = {
    ...rsvp,
    id: 'rsvp-' + Date.now(),
    created_at: new Date().toISOString(),
  };
  const updated = [newItem, ...all];
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
  localStorage.removeItem(STORAGE_KEYS.EVENT_CONFIG);
  localStorage.removeItem('mhw_event_config_v2');
  localStorage.removeItem('mhw_event_config_v1');
  localStorage.removeItem(STORAGE_KEYS.RSVPS);
  localStorage.removeItem(STORAGE_KEYS.BLESSINGS);
  localStorage.removeItem(STORAGE_KEYS.SYMBOLIC);
  localStorage.removeItem(STORAGE_KEYS.TIMELINE);
  localStorage.removeItem(STORAGE_KEYS.GALLERY);
}
