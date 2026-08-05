import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[DB] SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib di-set pada production')
  }
  console.warn('[DB] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set di server/.env. Query DB akan gagal.')
}

// Service role key dipakai karena otorisasi role ditangani middleware Express kita sendiri.
export const db = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
})
