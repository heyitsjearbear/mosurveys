-- Enable Realtime for surveys and responses tables
-- This allows dashboard stats to update live when surveys are created/updated/deleted
-- or when responses are submitted

-- Enable Realtime for surveys table
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;

-- Enable Realtime for responses table
ALTER PUBLICATION supabase_realtime ADD TABLE responses;

-- Verify Realtime is enabled (optional check)
COMMENT ON TABLE surveys IS 'Survey definitions with versioning support (Realtime enabled)';
COMMENT ON TABLE responses IS 'User responses to surveys with AI-generated insights (Realtime enabled)';

