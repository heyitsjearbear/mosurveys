import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// ─────────────────────────────────────────────
// Supabase Admin Client (Server-side ONLY)
// ─────────────────────────────────────────────
// ⚠️ NEVER import this in client components!
// This client uses the service role key and bypasses RLS.
// Only use in API routes and server components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase admin environment variables. Please check your .env file.'
  )
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

