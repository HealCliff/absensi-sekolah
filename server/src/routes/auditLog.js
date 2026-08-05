import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'

const router = Router()

router.use(auth, requireActiveUser(db), requireRole('tata_usaha', 'kepala_sekolah'))

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '25', 10) || 25))
  const q = String(req.query.q || '').trim()
  let query = db
    .from('audit_log')
    .select('id, user_id, aktivitas, created_at, users(nama, nik)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('aktivitas', `%${q}%`)

  const start = (page - 1) * limit
  const { data, error, count } = await query.range(start, start + limit - 1)
  if (error) throw error

  res.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}))

export default router
