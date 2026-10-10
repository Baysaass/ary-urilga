export interface EventConfig {
  hosts: string;
  inviteeKicker: string;
  title: string;
  subtitle: string;
  year: number;
  month: number;
  day: number;
  day2?: number;
  selectedDay?: 1 | 2;
  timeRange: string;
  timeStartTime: string; // for calendar ISO: "15:00"
  timeEndTime: string;   // for calendar ISO: "20:00"
  locationCity: string;
  locationDistrict: string;
  locationAddress: string;
  googleMapsUrl: string;
  introQuote: string;
  introSubtext: string;
  closingQuote: string;
}

export interface RSVP {
  id: string;
  guest_name: string;
  attending: 'yes' | 'no' | 'with_family' | string;
  guest_count: number;
  adults?: number;
  children?: number;
  arrival_time: string;
  phone_or_note?: string;
  event_day?: string; // '10-23' | '10-24'
  created_at: string;
}

export type BlessingStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface Blessing {
  id: string;
  guest_name: string;
  message: string;
  anonymous: boolean;
  status: BlessingStatus;
  reactions: {
    heart: number;
    sparkle: number;
    pray: number;
  };
  created_at: string;
  approved_at?: string;
}

export interface SymbolicGift {
  id: string;
  icon: string;
  label: string;
  count: number;
  color: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  aspect: 'portrait' | 'landscape';
  imageUrl: string;
}
