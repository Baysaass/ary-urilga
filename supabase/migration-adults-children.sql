-- ==============================================================================
-- RSVP Adults & Children Columns Migration
-- Run this in Supabase Dashboard -> SQL Editor if you want separate database
-- columns for adults and children.
-- ==============================================================================

alter table public.rsvps add column if not exists adults integer default 1;
alter table public.rsvps add column if not exists children integer default 0;
