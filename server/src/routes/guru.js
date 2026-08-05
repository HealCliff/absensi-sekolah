import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'
import { writeAuditLog } from '../utils/audit.js'

const router = Router()

router.use(auth, requireActiveUser(db), requireRole('tata_usaha'))

// GET /api/guru — daftar guru (TU)
router.get('/', asyncHandler(async (req, res) => {
  const { q, status, page, limit } = req.query
  const usePagination = page !== undefined || limit !== undefined
  const currentPage = Math.max(1, Number.parseInt(page || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit || '25', 10) || 25))
  let query = db.from('guru').select('*', usePagination ? { count: 'exact' } : undefined).order('nama', { ascending: true })
  if (status === 'aktif') query = query.eq('status_aktif', true)
  if (status === 'nonaktif') query = query.eq('status_aktif', false)
  if (q) query = query.or(`nama.ilike.%${q}%,nip_nuptk.ilike.%${q}%`)

  if (usePagination) {
    const start = (currentPage - 1) * pageSize
    query = query.range(start, start + pageSize - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  res.json({
    data,
    ...(usePagination ? { pagination: { page: currentPage, limit: pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) } } : {}),
  })
}))

// GET /api/guru/:id — detail guru
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await db.from('guru').select('*').eq('id', req.params.id).maybeSingle()
  if (error) throw error
  if (!data) return res.status(404).json({ message: 'Guru tidak ditemukan' })
  res.json({ data })
}))

// POST /api/guru — tambah guru (TU)
router.post('/', asyncHandler(async (req, res) => {
  const { nama, nip_nuptk, jenis_kelamin, kontak, jabatan_mapel, status_aktif } = req.body
  if (!nama || !nip_nuptk || !jenis_kelamin) {
    return res.status(400).json({ message: 'nama, nip_nuptk, dan jenis_kelamin wajib diisi' })
  }
  const { data, error } = await db
    .from('guru')
    .insert({ nama, nip_nuptk, jenis_kelamin, kontak, jabatan_mapel, status_aktif: status_aktif ?? true })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'NIP/NUPTK sudah digunakan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Tambah guru ${data.nama}`)
  res.status(201).json({ data })
}))

// PUT /api/guru/:id — update guru
router.put('/:id', asyncHandler(async (req, res) => {
  const { nama, nip_nuptk, jenis_kelamin, kontak, jabatan_mapel, status_aktif } = req.body
  const { data, error } = await db
    .from('guru')
    .update({ nama, nip_nuptk, jenis_kelamin, kontak, jabatan_mapel, status_aktif })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'NIP/NUPTK sudah digunakan' })
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'Guru tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Update guru ${data.nama}`)
  res.json({ data })
}))

// DELETE /api/guru/:id — hapus guru
router.delete('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await db.from('guru').delete().eq('id', req.params.id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'Guru tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Hapus guru ${data.nama}`)
  res.json({ message: 'Guru berhasil dihapus', data })
}))

export default router
