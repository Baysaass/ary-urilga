-- ==============================================================================
-- ШИНЭ ГЭРИЙН ЦАЙЛЛАГА: 2 ӨДРИЙН СИСТЕМИЙН МИГРАЦИ (MIGRATION)
-- 
-- Та өмнө нь үндсэн schema.sql-ийг ажиллуулчихсан тул хүснэгтүүдийг устгах шаардлагагүй.
-- Зөвхөн доорх SQL кодыг Supabase Dashboard -> SQL Editor хэсэгт хуулаад "Run" дарна уу.
-- ==============================================================================

-- 1. RSVPs хүснэгтэд event_day багана нэмэх (хэрэв ороогүй бол)
alter table if exists public.rsvps 
  add column if not exists event_day text default '10-23';

-- 2. Event config хүснэгтэд 2 дахь өдрийн day2 багана нэмэх
alter table if exists public.event_config 
  add column if not exists day2 integer default 24;

-- 3. Өмнө нь 9 гэж хадгалагдсан өдрийг 10 сарын 23 ба 24 болгон шинэчлэх
update public.event_config
set
  year = 2026,
  month = 10,
  day = 23,
  day2 = 24
where id = 'main';

-- 4. Хэрэв id = 'main' бичлэг байхгүй байвал автоматаар үүсгэх
insert into public.event_config (id, year, month, day, day2)
values ('main', 2026, 10, 23, 24)
on conflict (id) do update set
  year = 2026,
  month = 10,
  day = 23,
  day2 = 24;

-- 5. Бодлого (RLS) шалгалт - anon хэрэглэгчид бүх зөвшөөрөл олгогдсон эсэх
do $$
begin
  -- rsvps болон event_config-ийн update/select эрхүүдийг баталгаажуулах
  if not exists (
    select 1 from pg_policies 
    where tablename = 'event_config' and policyname = 'Allow anon update config'
  ) then
    create policy "Allow anon update config" on public.event_config for update using (true);
  end if;
exception
  when others then null;
end $$;
