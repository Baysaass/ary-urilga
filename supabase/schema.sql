-- ==============================================================================
-- ШИНЭ ГЭРИЙН ЦАЙЛЛАГА (Mongolian Housewarming Invitation)
-- Supabase Database Schema
--
-- Энэхүү SQL скриптийг Supabase төслийнхөө:
-- Dashboard -> SQL Editor хэсэгт хуулаад "Run" товчийг дарж ажиллуулна.
-- ==============================================================================

-- 1. Ерөөлийн хүснэгт (Blessings)
create table if not exists public.blessings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  approved_at timestamptz default now()
);

-- 2. Ерөөлд өгсөн реакцууд (Blessing Reactions)
-- Нэг зочин нэг ерөөлд нэг л төрлийн реакц сонгох боломжтой
create table if not exists public.blessing_reactions (
  id uuid primary key default gen_random_uuid(),
  blessing_id uuid not null references public.blessings(id) on delete cascade,
  guest_id text not null,
  reaction_type text not null check (reaction_type in ('heart', 'sparkle', 'pray')),
  created_at timestamptz not null default now(),
  constraint unique_blessing_guest_reaction unique (blessing_id, guest_id)
);

-- 3. Бэлгэдэлт бэлэг илгээлт (Guest Symbolic Gifts)
-- Зочид шинэ гэрт бэлгэдэл (Хайр, Аз хийморь, Өсөлт гэх мэт) үлдээсэн түүх
create table if not exists public.guest_gifts (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null,
  gift_id text not null check (gift_id in ('love', 'fortune', 'growth', 'joy', 'peace', 'abundance')),
  created_at timestamptz not null default now(),
  constraint unique_guest_gift unique (guest_id, gift_id)
);

-- 4. Хүрэлцэн ирэх баталгаажуулалт (RSVP)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  attending text not null check (attending in ('yes', 'no')),
  guest_count integer not null default 1,
  arrival_time text default '',
  phone_or_note text default '',
  event_day text default '10-23',
  created_at timestamptz not null default now()
);

-- Хэрэв хүснэгт өмнө нь үүссэн бол баганыг нэмэх:
alter table public.rsvps add column if not exists event_day text default '10-23';

-- 5. Эвент тохиргоо (Event Config)
create table if not exists public.event_config (
  id text primary key default 'main',
  hosts text not null default 'Батдорж & Ариунбаяр',
  invitee_kicker text default 'таныг',
  title text not null default 'Шинэ гэрийн цайллагад',
  subtitle text default 'хүндэтгэн урьж байна.',
  year integer not null default 2026,
  month integer not null default 10,
  day integer not null default 9,
  time_range text default '',
  location_city text default 'Даланзадгад',
  location_district text default '3-р баг',
  location_address text default '34-р байр, 3 давхарт, 10 тоот',
  google_maps_url text default 'https://maps.app.goo.gl/7k28f1YBfnej28zEA',
  intro_quote text default 'Шинэ гэр, шинэ дурсамж, шинэ эхлэл.',
  intro_subtext text default 'Шинэ гэрийнхээ босгыг мялааж, баярт мөчөө та бүхэнтэйгээ хуваалцахыг хүсэж байна.',
  closing_quote text default 'Шинэ гэрийг эд зүйлс биш, хамтдаа бүтээсэн дурсамж, инээд хөөр, сайхан ерөөл гэр болгодог.',
  updated_at timestamptz not null default now()
);

-- Үндсэн анхдагч тохиргоог оруулах (Хэрэв байхгүй бол)
insert into public.event_config (id)
values ('main')
on conflict (id) do nothing;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ТОХИРГОО
-- Урилгын веб хуудаснаас anon key ашиглан шууд хандах боломжийг олгоно.
-- ==============================================================================

alter table public.blessings enable row level security;
alter table public.blessing_reactions enable row level security;
alter table public.guest_gifts enable row level security;
alter table public.rsvps enable row level security;
alter table public.event_config enable row level security;

-- Blessings бодлогууд
create policy "Allow anon select blessings" on public.blessings
  for select using (true);

create policy "Allow anon insert blessings" on public.blessings
  for insert with check (true);

create policy "Allow anon update blessings" on public.blessings
  for update using (true);

create policy "Allow anon delete blessings" on public.blessings
  for delete using (true);

-- Reactions бодлогууд
create policy "Allow anon select reactions" on public.blessing_reactions
  for select using (true);

create policy "Allow anon insert/update reactions" on public.blessing_reactions
  for insert with check (true);

create policy "Allow anon update reactions" on public.blessing_reactions
  for update using (true);

create policy "Allow anon delete reactions" on public.blessing_reactions
  for delete using (true);

-- Guest Gifts бодлогууд
create policy "Allow anon select gifts" on public.guest_gifts
  for select using (true);

create policy "Allow anon insert gifts" on public.guest_gifts
  for insert with check (true);

create policy "Allow anon delete gifts" on public.guest_gifts
  for delete using (true);

-- RSVPs бодлогууд
create policy "Allow anon select rsvps" on public.rsvps
  for select using (true);

create policy "Allow anon insert rsvps" on public.rsvps
  for insert with check (true);

create policy "Allow anon delete rsvps" on public.rsvps
  for delete using (true);

-- Event Config бодлогууд
create policy "Allow anon select config" on public.event_config
  for select using (true);

create policy "Allow anon update config" on public.event_config
  for update using (true);

create policy "Allow anon insert config" on public.event_config
  for insert with check (true);

-- ==============================================================================
-- REALTIME ДЭМЖЛЭГ
-- Реакц, ерөөл, бэлгэдлүүд хуудсыг refresh хийхгүйгээр шууд амьдаар шинэчлэгдэнэ
-- ==============================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'blessings') then
    alter publication supabase_realtime add table public.blessings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'blessing_reactions') then
    alter publication supabase_realtime add table public.blessing_reactions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'guest_gifts') then
    alter publication supabase_realtime add table public.guest_gifts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'rsvps') then
    alter publication supabase_realtime add table public.rsvps;
  end if;
exception
  when others then null;
end $$;
