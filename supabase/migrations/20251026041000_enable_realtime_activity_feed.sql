-- =====================================================
-- Enable Realtime for Activity Feed
-- =====================================================
-- This migration enables Supabase Realtime for the activity_feed table
-- so that live updates can be pushed to connected clients.

-- Enable replica identity to track all changes
alter table public.activity_feed replica identity full;

-- Add activity_feed to the realtime publication
-- This allows subscribed clients to receive live updates
alter publication supabase_realtime add table public.activity_feed;

-- Grant necessary permissions for realtime
grant select on public.activity_feed to anon, authenticated;

-- Log completion
comment on table public.activity_feed is 'Event log for webhooks and activity tracking (Realtime enabled)';

