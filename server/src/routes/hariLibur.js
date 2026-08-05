import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'
import { writeAuditLog } from '../utils/audit.js'

const router = Router()

router.use(auth, requireActiveUser(db), requireRole('tata_usaha'))

// GET /api/hari-libur — daftar hari libur
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await db.from('hari_libur').select('*').order('tanggal', { ascending: true })
  if (error) throw error
  res.json({ data })
}))

// POST /api/hari-libur
router.post('/', asyncHandler(async (req, res) => {
  const { tanggal, tanggal_mulai, tanggal_selesai, keterangan } = req.body
  if (!keterangan) return res.status(400).json({ message: 'keterangan wajib diisi' })
  if (!tanggal && !(tanggal_mulai && tanggal_selesai)) {
    return res.status(400).json({ message: 'Isi tanggal (satu hari) ATAU tanggal_mulai & tanggal_selesai (rentang)' })
  }
  const { data, error } = await db
    .from('hari_libur')
    .insert({ tanggal: tanggal || null, tanggal_mulai: tanggal_mulai || null, tanggal_selesai: tanggal_selesai || null, keterangan })
    .select()
    .single()
  if (error) throw error
  await writeAuditLog(req.user.id, `Tambah hari libur ${keterangan}`)
  res.status(201).json({ data })
}))

// PUT /api/hari-libur/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { tanggal, tanggal_mulai, tanggal_selesai, keterangan } = req.body
  const { data, error } = await db
    .from('hari_libur')
    .update({ tanggal: tanggal || null, tanggal_mulai: tanggal_mulai || null, tanggal_selesai: tanggal_selesai || null, keterangan })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'Hari libur tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Update hari libur id ${data.id}`)
  res.json({ data })
}))

// DELETE /api/hari-libur/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await db.from('hari_libur').delete().eq('id', req.params.id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'Hari libur tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Hapus hari libur id ${data.id}`)
  res.json({ message: 'Hari libur berhasil dihapus', data })
}))

export default router
