import { Router } from 'express'
import { db } from '../config/db.js'
import { signToken } from '../utils/jwt.js'
import { hashPassword, verifyPassword } from '../utils/bcrypt.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireActiveUser } from '../middleware/auth.js'
import { randomInt } from 'node:crypto'
import { writeAuditLog } from '../utils/audit.js'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()
const MAX_LOGIN_ATTEMPTS = Number.parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10)
const LOGIN_LOCK_MINUTES = Number.parseInt(process.env.LOGIN_LOCK_MINUTES || '15', 10)
const PASSWORD_MIN_LENGTH = Number.parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10)

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 10; i++) result += chars[randomInt(chars.length)]
  return result
}

function isMissingLoginSecurityColumns(error) {
  return error?.code === 'PGRST204' || error?.code === '42703' || error?.message?.includes('failed_login_attempts')
}

// POST /api/auth/login — login NIK + password
router.post('/login', asyncHandler(async (req, res) => {
  const { nik, password } = req.body
  if (!/^\d{16}$/.test(String(nik || '').trim())) {
    return res.status(400).json({ message: 'NIK harus 16 digit angka' })
  }
  if (!password) {
    return res.status(400).json({ message: 'Password wajib diisi' })
  }

  const baseUserSelect = 'id, nik, password_hash, role, guru_id, nama, is_first_login, status_aktif'
  let securityAvailable = true
  let { data: user, error } = await db
    .from('users')
    .select(`${baseUserSelect}, failed_login_attempts, locked_until`)
    .eq('nik', String(nik).trim())
    .maybeSingle()
  if (isMissingLoginSecurityColumns(error)) {
    securityAvailable = false
    console.warn('[AUTH] Migration 0004 belum diterapkan; login lockout belum aktif.')
    const fallback = await db.from('users').select(baseUserSelect).eq('nik', String(nik).trim()).maybeSingle()
    user = fallback.data
    error = fallback.error
  }
  if (error) throw error

  if (user?.locked_until && new Date(user.locked_until) > new Date()) {
    return res.status(429).json({ message: 'Akun terkunci sementara karena terlalu banyak percobaan login' })
  }

  const ok = await verifyPassword(password, user?.password_hash)
  if (!user) return res.status(401).json({ message: 'NIK atau password salah' })
  if (!ok) {
    const failedAttempts = (user.failed_login_attempts || 0) + 1
    const isLocked = failedAttempts >= MAX_LOGIN_ATTEMPTS
    const update = isLocked
      ? { failed_login_attempts: 0, locked_until: new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000).toISOString() }
      : { failed_login_attempts: failedAttempts, locked_until: null }
    if (securityAvailable) await db.from('users').update(update).eq('id', user.id)
    return res.status(isLocked ? 429 : 401).json({
      message: isLocked ? 'Akun terkunci sementara karena terlalu banyak percobaan login' : 'NIK atau password salah',
    })
  }
  if (user.status_aktif !== true) return res.status(403).json({ message: 'Akun Anda dinonaktifkan, hubungi Tata Usaha' })

  if (securityAvailable) await db.from('users').update({ failed_login_attempts: 0, locked_until: null }).eq('id', user.id)

  const token = signToken(user)
  await writeAuditLog(user.id, 'Login')

  res.json({
    token,
    user: {
      id: user.id,
      nik: user.nik,
      role: user.role,
      guru_id: user.guru_id,
      nama: user.nama,
      isFirstLogin: user.is_first_login,
    },
  })
}))

// POST /api/auth/ganti-password — ganti password saat first login / ubah password
router.post('/ganti-password', auth, requireActiveUser(db), asyncHandler(async (req, res) => {
  const { password_lama, password_baru } = req.body
  if (!password_baru || String(password_baru).length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ message: `Password baru minimal ${PASSWORD_MIN_LENGTH} karakter` })
  }

  const { data: user, error } = await db
    .from('users')
    .select('password_hash, is_first_login')
    .eq('id', req.user.id)
    .maybeSingle()
  if (error) throw error
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

  if (!user.is_first_login) {
    const ok = await verifyPassword(password_lama, user.password_hash)
    if (!ok) return res.status(400).json({ message: 'Password lama salah' })
  }

  const passwordHash = await hashPassword(String(password_baru))
  const { error: updateError } = await db
    .from('users')
    .update({ password_hash: passwordHash, is_first_login: false, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
  if (updateError) throw updateError

  await writeAuditLog(req.user.id, 'Ganti password')
  res.json({ message: 'Password berhasil diganti' })
}))

// POST /api/auth/me — ambil data user dari token (untuk validasi sesi)
router.get('/me', auth, requireActiveUser(db), asyncHandler(async (req, res) => {
  const { data: user, error } = await db
    .from('users')
    .select('id, nik, role, guru_id, nama, is_first_login, status_aktif')
    .eq('id', req.user.id)
    .maybeSingle()
  if (error) throw error
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })
  res.json({ user })
}))

// POST /api/auth/reset-password — TU reset password user (khusus tata_usaha)
router.post('/reset-password', auth, requireActiveUser(db), asyncHandler(async (req, res) => {
  if (req.user.role !== 'tata_usaha') return res.status(403).json({ message: 'Forbidden' })
  const { user_id } = req.body
  if (!user_id) return res.status(400).json({ message: 'user_id wajib diisi' })

  const tempPassword = generateTemporaryPassword()
  const passwordHash = await hashPassword(tempPassword)
  const { error } = await db
    .from('users')
    .update({ password_hash: passwordHash, is_first_login: true, updated_at: new Date().toISOString() })
    .eq('id', user_id)
  if (error) throw error

  await writeAuditLog(req.user.id, `Reset password user id ${user_id}`)
  res.json({ message: 'Password berhasil di-reset', password: tempPassword })
}))

export default router
