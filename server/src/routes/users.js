import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'
import { hashPassword } from '../utils/bcrypt.js'
import { writeAuditLog } from '../utils/audit.js'

const router = Router()

router.use(auth, requireActiveUser(db), requireRole('tata_usaha'))

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 10; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

// GET /api/users — daftar akun (TU)
router.get('/', asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query
  const usePagination = page !== undefined || limit !== undefined
  const currentPage = Math.max(1, Number.parseInt(page || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit || '25', 10) || 25))
  let query = db.from('users').select('id, nik, role, guru_id, nama, is_first_login, status_aktif', usePagination ? { count: 'exact' } : undefined).order('nama')
  if (q) query = query.or(`nama.ilike.%${q}%,nik.ilike.%${q}%`)
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

// POST /api/users — tambah akun (TU), buat password sementara
router.post('/', asyncHandler(async (req, res) => {
  const { nama, nik, role, guru_id } = req.body
  if (!nama || !/^\d{16}$/.test(String(nik || '').trim())) {
    return res.status(400).json({ message: 'Nama wajib diisi dan NIK harus 16 digit angka' })
  }
  if (!['guru', 'tata_usaha', 'kepala_sekolah'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' })
  }

  const password = generateTemporaryPassword()
  const passwordHash = await hashPassword(password)
  const { data, error } = await db
    .from('users')
    .insert({
      nama,
      nik: String(nik).trim(),
      role,
      guru_id: guru_id || null,
      password_hash: passwordHash,
      is_first_login: true,
      status_aktif: true,
    })
    .select('id, nik, role, guru_id, nama, is_first_login, status_aktif')
    .single()
  if (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'NIK sudah terdaftar' })
    throw error
  }
  await writeAuditLog(req.user.id, `Tambah akun ${data.nama}`)
  res.status(201).json({ data, password })
}))

// PUT /api/users/:id/role — ubah role (hak akses)
router.put('/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!['guru', 'tata_usaha', 'kepala_sekolah'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' })
  }
  const { data, error } = await db
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, nik, role, guru_id, nama, is_first_login, status_aktif')
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'User tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Ubah role user id ${data.id} ke ${role}`)
  res.json({ data })
}))

// PATCH /api/users/:id/status — aktif/nonaktifkan akun
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status_aktif } = req.body
  if (typeof status_aktif !== 'boolean') return res.status(400).json({ message: 'status_aktif wajib boolean' })
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ message: 'Tidak bisa menonaktifkan akun sendiri' })
  }
  const { data, error } = await db
    .from('users')
    .update({ status_aktif, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, nik, role, guru_id, nama, is_first_login, status_aktif')
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'User tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `${status_aktif ? 'Aktifkan' : 'Nonaktifkan'} akun ${data.nama}`)
  res.json({ data })
}))

// POST /api/users/:id/reset-password — reset password (TU)
router.post('/:id/reset-password', asyncHandler(async (req, res) => {
  const password = generateTemporaryPassword()
  const passwordHash = await hashPassword(password)
  const { data, error } = await db
    .from('users')
    .update({ password_hash: passwordHash, is_first_login: true, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, nik, role, guru_id, nama, is_first_login, status_aktif')
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'User tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Reset password akun ${data.nama}`)
  res.json({ data, password })
}))

// DELETE /api/users/:id — hapus akun
router.delete('/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' })
  }
  const { data, error } = await db.from('users').delete().eq('id', req.params.id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'User tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Hapus akun ${data.nama}`)
  res.json({ message: 'Akun berhasil dihapus', data })
}))

export default router
