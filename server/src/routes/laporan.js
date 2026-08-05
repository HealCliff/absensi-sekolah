import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'

const router = Router()

router.use(auth, requireActiveUser(db), requireRole('tata_usaha', 'kepala_sekolah'))

// GET /api/laporan/rekap?mulai=YYYY-MM-DD&sampai=YYYY-MM-DD
// Rekap per guru dalam rentang tanggal: total hadir, terlambat, izin, sakit, alpa
router.get('/rekap', asyncHandler(async (req, res) => {
  const { mulai, sampai } = req.query
  if (!mulai || !sampai) return res.status(400).json({ message: 'mulai dan sampai wajib diisi' })

  const { data: absensi, error } = await db
    .from('absensi')
    .select('guru_id, status')
    .gte('tanggal', mulai)
    .lte('tanggal', sampai)
  if (error) throw error

  const { data: guruList, error: guruError } = await db.from('guru').select('*').eq('status_aktif', true)
  if (guruError) throw guruError

  const data = guruList.map((guru) => {
    const rows = absensi.filter((a) => a.guru_id === guru.id)
    const count = (s) => rows.filter((r) => r.status === s).length
    const hadir = count('hadir') + count('masuk') + count('pulang')
    const terlambat = count('terlambat')
    const izin = count('izin')
    const sakit = count('sakit')
    const dinas = count('dinas')
    const alpa = count('alpa')
    const totalHariKerja = rows.length // satu catatan absensi untuk setiap guru dan hari
    const persentaseKehadiran = totalHariKerja ? Math.round(((hadir + terlambat) / totalHariKerja) * 100) : 0
    return {
      id: guru.id,
      nama: guru.nama,
      nip_nuptk: guru.nip_nuptk,
      jabatan_mapel: guru.jabatan_mapel,
      totalHariKerja: rows.length,
      hadir,
      terlambat,
      izin,
      sakit,
      dinas,
      alpa,
      persentaseKehadiran,
    }
  })

  res.json({ data, jumlahGuru: guruList.length })
}))

// GET /api/laporan/harian?tanggal=YYYY-MM-DD
router.get('/harian', asyncHandler(async (req, res) => {
  const { tanggal } = req.query
  if (!tanggal) return res.status(400).json({ message: 'tanggal wajib diisi' })

  const { data, error } = await db
    .from('absensi')
    .select('*, guru(nama, jabatan_mapel)')
    .eq('tanggal', tanggal)
    .order('guru_id', { ascending: true })
  if (error) throw error
  res.json({ data })
}))

export default router
