import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// ─────────────────────────────────────────────
// Supabase Client (Client-side)
// ─────────────────────────────────────────────
// This client uses the anon key and is safe to use in browser code.
// It respects Row Level Security (RLS) policies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

