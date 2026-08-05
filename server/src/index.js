import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import guruRoutes from './routes/guru.js'
import absensiRoutes from './routes/absensi.js'
import laporanRoutes from './routes/laporan.js'
import hariLiburRoutes from './routes/hariLibur.js'
import usersRoutes from './routes/users.js'
import pengaturanAbsensiRoutes from './routes/pengaturanAbsensi.js'
import auditLogRoutes from './routes/auditLog.js'
import waktuRoutes from './routes/waktu.js'

import { notFound, errorHandler } from './utils/helpers.js'

dotenv.config()

const app = express()
app.use(helmet())
const allowedOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const corsOrigin = allowedOrigins?.length
  ? allowedOrigins
  : process.env.NODE_ENV === 'production'
    ? false
    : true
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: '100kb' }))

// Rate limit global API
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak permintaan, coba lagi nanti' },
  })
)

// Rate limit khusus login — anti brute force (30 percobaan / 15 menit)
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak percobaan login, tunggu 15 menit' },
  })
)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/guru', guruRoutes)
app.use('/api/absensi', absensiRoutes)
app.use('/api/laporan', laporanRoutes)
app.use('/api/hari-libur', hariLiburRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/pengaturan-absensi', pengaturanAbsensiRoutes)
app.use('/api/audit-log', auditLogRoutes)
app.use('/api/waktu', waktuRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`[SERVER] API berjalan di http://localhost:${PORT}`)
})
