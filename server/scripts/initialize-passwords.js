import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

dotenv.config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di server/.env')
  process.exit(1)
}

const users = [
  { key: 'GURU', label: 'Guru', nik: '1234567890123456' },
  { key: 'TU', label: 'Tata Usaha', nik: '9876543210987654' },
  { key: 'KEPSEK', label: 'Kepala Sekolah', nik: '1111222233334444' },
]
const db = createClient(url, key, { auth: { persistSession: false } })
const rl = createInterface({ input, output })

try {
  for (const user of users) {
    const envKey = `INITIAL_${user.key}_PASSWORD`
    const password = process.env[envKey] || await rl.question(`Password ${user.label} (minimal 8 karakter): `)
    if (password.length < 8) throw new Error(`Password ${user.label} minimal 8 karakter`)

    const passwordHash = await bcrypt.hash(password, 10)
    const { error } = await db
      .from('users')
      .update({ password_hash: passwordHash, is_first_login: false })
      .eq('nik', user.nik)
    if (error) throw error
    console.log(`Password ${user.label} berhasil disimpan.`)
  }
} finally {
  rl.close()
}
