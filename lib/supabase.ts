import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Supabase istemcisi (client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase istemcisi (server-side, admin yetkilerine sahip)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Singleton pattern ile client-side istemci
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Server-side istemci
export const createServerSupabaseClient = () => {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "", {
    auth: {
      persistSession: false,
    },
  })
}
