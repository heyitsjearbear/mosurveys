-- =====================================================
-- Fix RLS Policy for responses table
-- Issue: INSERT works, but .select() after insert fails for anon users
-- =====================================================

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read responses in their org" ON public.responses;

-- Create new SELECT policy allowing anon to read responses
-- This is needed because .insert().select() requires both INSERT and SELECT permissions
CREATE POLICY "Anyone can read responses"
  ON public.responses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add comment explaining this is a development policy
COMMENT ON POLICY "Anyone can read responses" ON public.responses
  IS 'Development policy - allows anon access for .insert().select() pattern. TODO: Restrict to org members when auth is implemented.';

