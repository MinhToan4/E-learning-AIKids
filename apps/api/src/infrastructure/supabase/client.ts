/**
 * Supabase JS client (anon/publishable key) — optional for Storage/Realtime/REST.
 * Primary app data still goes through Prisma → Postgres (DATABASE_URL).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '../../config/env.js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return client
}
