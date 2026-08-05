import { verifyToken } from '../utils/jwt.js'

export function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Unauthorized: token tidak ditemukan' })

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized: token tidak valid atau kedaluwarsa' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Anda tidak memiliki akses' })
    }
    next()
  }
}

export function requireActiveUser(db) {
  return async (req, res, next) => {
    const { data } = await db
      .from('users')
      .select('status_aktif')
      .eq('id', req.user.id)
      .maybeSingle()
    if (!data || data.status_aktif !== true) {
      return res.status(403).json({ message: 'Akun Anda dinonaktifkan, hubungi Tata Usaha' })
    }
    next()
  }
}
