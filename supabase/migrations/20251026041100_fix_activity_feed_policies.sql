-- =====================================================
-- Fix Activity Feed RLS Policies
-- =====================================================
-- This migration fixes the broken policy and allows anon access
-- so that the client-side realtime subscription works

-- Drop the broken policy (missing table name)
drop policy if exists "Authenticated users can create activity events" on public.activity_feed;

-- Create proper insert policy
create policy "Authenticated users can create activity events"
  on public.activity_feed
  for insert
  to authenticated
  with check (true);

-- Allow anonymous users to read activity feed (for realtime subscriptions)
create policy "Anonymous users can read activity feed"
  on public.activity_feed
  for select
  to anon
  using (true);

-- Grant necessary permissions
grant select on public.activity_feed to anon;

-- Add comment
comment on policy "Anonymous users can read activity feed" on public.activity_feed is 'Allows client-side realtime subscriptions with anon key';

