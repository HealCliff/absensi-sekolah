import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h'

if (!SECRET) {
  console.error('[JWT] JWT_SECRET belum di-set di server/.env — server tidak akan jalan.')
  process.exit(1)
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, nik: user.nik, role: user.role, guru_id: user.guru_id, nama: user.nama },
    SECRET,
    { expiresIn: EXPIRES_IN }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}
