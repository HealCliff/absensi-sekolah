import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'
import { writeAuditLog } from '../utils/audit.js'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()
const DEFAULT_JAM_MASUK = process.env.JAM_BATAS_MASUK || '07:15'
const DEFAULT_JAM_PULANG = process.env.JAM_BATAS_PULANG || '13:00'
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function normaliseTime(value, fallback) {
  const time = String(value || fallback)
  return time.slice(0, 5)
}

function responseData(data) {
  return {
    jam_batas_masuk: normaliseTime(data?.jam_batas_masuk, DEFAULT_JAM_MASUK),
    jam_batas_pulang: normaliseTime(data?.jam_batas_pulang, DEFAULT_JAM_PULANG),
    updated_at: data?.updated_at || null,
  }
}

export async function getPengaturanAbsensi() {
  const { data, error } = await db
    .from('pengaturan_absensi')
    .select('jam_batas_masuk, jam_batas_pulang, updated_at')
    .eq('id', 1)
    .maybeSingle()

  // Keep the existing attendance flow working until migration 0002 is applied.
  if (error?.code === 'PGRST205' || error?.code === '42P01') {
    return responseData()
  }
  if (error) throw error
  return responseData(data)
}

router.use(auth, requireActiveUser(db))

router.get('/', asyncHandler(async (req, res) => {
  res.json({ data: await getPengaturanAbsensi() })
}))

router.put('/', requireRole('tata_usaha'), asyncHandler(async (req, res) => {
  const jam_batas_masuk = normaliseTime(req.body.jam_batas_masuk, '')
  const jam_batas_pulang = normaliseTime(req.body.jam_batas_pulang, '')

  if (!TIME_PATTERN.test(jam_batas_masuk) || !TIME_PATTERN.test(jam_batas_pulang)) {
    return res.status(400).json({ message: 'Format jam harus HH:mm' })
  }
  if (jam_batas_masuk >= jam_batas_pulang) {
    return res.status(400).json({ message: 'Jam masuk harus lebih awal dari jam pulang' })
  }

  const { data, error } = await db
    .from('pengaturan_absensi')
    .upsert({
      id: 1,
      jam_batas_masuk,
      jam_batas_pulang,
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('jam_batas_masuk, jam_batas_pulang, updated_at')
    .single()
  if (error) throw error

  await writeAuditLog(req.user.id, `Ubah jam absensi ${jam_batas_masuk}-${jam_batas_pulang}`)
  res.json({ data: responseData(data), pesan: 'Pengaturan jam absensi disimpan' })
}))

export default router
