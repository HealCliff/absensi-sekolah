import { Router } from 'express'
import { db } from '../config/db.js'
import { asyncHandler } from '../utils/helpers.js'
import { auth, requireRole, requireActiveUser } from '../middleware/auth.js'
import { getPengaturanAbsensi } from './pengaturanAbsensi.js'
import { getSchoolDateTime } from '../utils/time.js'
import { normaliseAttendanceTime, validateAttendanceFields } from '../utils/attendanceValidation.js'
import { writeAuditLog } from '../utils/audit.js'
import { getHariLibur } from '../utils/hariLibur.js'
import dotenv from 'dotenv'

dotenv.config()

function isTerlambat(jamMasuk, batas) {
  return String(jamMasuk) > String(batas)
}

function isSebelumJamPulang(jamPulang, batas) {
  return String(jamPulang) < String(batas)
}

const router = Router()

// Semua route absensi butuh auth
router.use(auth, requireActiveUser(db))

// GET /api/absensi — daftar absensi (guru: punya sendiri; tu/kepsek: semua, dengan filter tanggal)
router.get('/', asyncHandler(async (req, res) => {
  const { tanggal, mulai, sampai, guru_id, status, q, page, limit } = req.query
  const usePagination = page !== undefined || limit !== undefined
  const currentPage = Math.max(1, Number.parseInt(page || '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit || '50', 10) || 50))

  const guruRelation = q ? 'guru!inner(nama, jabatan_mapel)' : 'guru(nama, jabatan_mapel)'
  let query = db.from('absensi').select(`*, ${guruRelation}`, usePagination ? { count: 'exact' } : undefined)

  if (req.user.role === 'guru') {
    const guru = await db
      .from('users')
      .select('guru_id')
      .eq('id', req.user.id)
      .maybeSingle()
    if (!guru.data?.guru_id) return res.status(400).json({ message: 'Akun guru belum terhubung ke data guru' })
    query = query.eq('guru_id', guru.data.guru_id)
  } else if (guru_id) {
    query = query.eq('guru_id', guru_id)
  }

  if (tanggal) query = query.eq('tanggal', tanggal)
  if (mulai) query = query.gte('tanggal', mulai)
  if (sampai) query = query.lte('tanggal', sampai)
  if (status) query = query.eq('status', status)
  if (q) query = query.ilike('guru.nama', `%${q}%`)
  query = query.order('tanggal', { ascending: false })
  if (usePagination) {
    const start = (currentPage - 1) * pageSize
    query = query.range(start, start + pageSize - 1)
  }

  const { data, error, count } = await query
  if (error) throw error
  res.json({
    data,
    ...(usePagination ? {
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    } : {}),
  })
}))

// POST /api/absensi — absen masuk / pulang (guru sendiri)
router.post('/', requireRole('guru'), asyncHandler(async (req, res) => {
  const { tipe, keterangan } = req.body
  if (!['masuk', 'pulang'].includes(tipe)) {
    return res.status(400).json({ message: 'tipe harus "masuk" atau "pulang"' })
  }

  const { data: me, error: meError } = await db
    .from('users')
    .select('guru_id')
    .eq('id', req.user.id)
    .maybeSingle()
  if (meError) throw meError
  if (!me?.guru_id) return res.status(400).json({ message: 'Akun guru belum terhubung ke data guru' })

  const now = new Date()
  const { tanggal, jam } = getSchoolDateTime(now)
  const hariLibur = await getHariLibur(tanggal)
  if (hariLibur) {
    return res.status(409).json({ message: `Hari ini libur: ${hariLibur.keterangan}`, holiday: true })
  }
  const pengaturan = await getPengaturanAbsensi()
  const jamBatasMasuk = pengaturan.jam_batas_masuk
  const jamBatasPulang = pengaturan.jam_batas_pulang

  const { data: existing } = await db
    .from('absensi')
    .select('*')
    .eq('guru_id', me.guru_id)
    .eq('tanggal', tanggal)
    .maybeSingle()

  if (tipe === 'masuk') {
    if (existing?.jam_masuk) return res.status(409).json({ message: 'Anda sudah absen masuk hari ini' })
    const terlambat = isTerlambat(jam, jamBatasMasuk)
    if (terlambat && !String(keterangan || '').trim()) {
      return res.status(400).json({ message: `Alasan wajib diisi karena absen masuk melewati ${jamBatasMasuk}`, reason_required: true })
    }
    const status = terlambat ? 'terlambat' : 'masuk'
    const alasan = terlambat ? String(keterangan).trim() : null
    let result
    if (existing) {
      result = await db.from('absensi').update({ jam_masuk: jam, status, keterangan: alasan, updated_at: now.toISOString() }).eq('id', existing.id).is('jam_masuk', null).select().single()
    } else {
      result = await db.from('absensi').insert({ guru_id: me.guru_id, tanggal, jam_masuk: jam, status, keterangan: alasan }).select().single()
    }
    if (result.error) {
      if (result.error.code === '23505' || result.error.code === 'PGRST116') return res.status(409).json({ message: 'Absen masuk sudah tercatat' })
      throw result.error
    }
    await writeAuditLog(req.user.id, `Absen masuk ${tanggal} ${jam}`)
    return res.status(201).json({ data: result.data, pesan: 'Absen masuk berhasil' })
  }

  // tipe === 'pulang'
  if (!existing?.jam_masuk) return res.status(409).json({ message: 'Anda belum absen masuk hari ini' })
  if (existing.jam_pulang) return res.status(409).json({ message: 'Anda sudah absen pulang hari ini' })
  const sebelumJamPulang = isSebelumJamPulang(jam, jamBatasPulang)
  if (sebelumJamPulang && !String(keterangan || '').trim()) {
    return res.status(400).json({ message: `Alasan wajib diisi karena absen pulang sebelum ${jamBatasPulang}`, reason_required: true })
  }
  const status = existing.status === 'terlambat' ? 'terlambat' : 'pulang'
  const alasanPulang = sebelumJamPulang ? String(keterangan).trim() : null
  const keteranganBaru = alasanPulang
    ? existing.keterangan
      ? `${existing.keterangan}; Pulang lebih awal: ${alasanPulang}`
      : alasanPulang
    : existing.keterangan || null
  const { data, error } = await db
    .from('absensi')
    .update({ jam_pulang: jam, status, keterangan: keteranganBaru, updated_at: now.toISOString() })
    .eq('id', existing.id)
    .is('jam_pulang', null)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(409).json({ message: 'Absen pulang sudah tercatat' })
    throw error
  }
  await writeAuditLog(req.user.id, `Absen pulang ${tanggal} ${jam}`)
  res.json({ data, pesan: 'Absen pulang berhasil' })
}))

// PUT /api/absensi/:id — koreksi TU (rekap)
router.put('/:id', requireRole('tata_usaha'), asyncHandler(async (req, res) => {
  const { jam_masuk, jam_pulang, status, keterangan } = req.body
  const { data: existing, error: existingError } = await db.from('absensi').select('*').eq('id', req.params.id).maybeSingle()
  if (existingError) throw existingError
  if (!existing) return res.status(404).json({ message: 'Data absensi tidak ditemukan' })

  const nextJamMasuk = normaliseAttendanceTime(jam_masuk === undefined ? existing.jam_masuk : jam_masuk)
  const nextJamPulang = normaliseAttendanceTime(jam_pulang === undefined ? existing.jam_pulang : jam_pulang)
  const nextStatus = status === undefined ? existing.status : status
  const nextKeterangan = keterangan === undefined ? existing.keterangan : keterangan
  const validationError = validateAttendanceFields({ status: nextStatus, jam_masuk: nextJamMasuk, jam_pulang: nextJamPulang, keterangan: nextKeterangan })
  if (validationError) return res.status(400).json({ message: validationError })

  const { data, error } = await db
    .from('absensi')
    .update({ jam_masuk: nextJamMasuk, jam_pulang: nextJamPulang, status: nextStatus, keterangan: nextKeterangan || null, dikoreksi_oleh: req.user.id, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*, guru(nama, jabatan_mapel)')
    .single()
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ message: 'Data absensi tidak ditemukan' })
    throw error
  }
  await writeAuditLog(req.user.id, `Koreksi absensi id ${data.id}`)
  res.json({ data, pesan: 'Koreksi berhasil disimpan' })
}))

// POST /api/absensi/manual — input manual absen (TU, untuk guru yang lupa absen)
router.post('/manual', requireRole('tata_usaha'), asyncHandler(async (req, res) => {
  const { guru_id, tanggal, jam_masuk, jam_pulang, status, keterangan } = req.body
  if (!guru_id || !tanggal) return res.status(400).json({ message: 'guru_id dan tanggal wajib diisi' })
  const pengaturan = await getPengaturanAbsensi()
  const nextJamMasuk = normaliseAttendanceTime(jam_masuk)
  const nextJamPulang = normaliseAttendanceTime(jam_pulang)
  const nextStatus = status || (nextJamMasuk && isTerlambat(nextJamMasuk, pengaturan.jam_batas_masuk) ? 'terlambat' : 'hadir')
  const validationError = validateAttendanceFields({ status: nextStatus, jam_masuk: nextJamMasuk, jam_pulang: nextJamPulang, keterangan })
  if (validationError) return res.status(400).json({ message: validationError })

  const { data, error } = await db
    .from('absensi')
    .upsert(
      {
        guru_id,
        tanggal,
        jam_masuk: nextJamMasuk,
        jam_pulang: nextJamPulang,
        status: nextStatus,
        keterangan: keterangan || null,
        dikoreksi_oleh: req.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guru_id,tanggal' }
    )
    .select('*, guru(nama, jabatan_mapel)')
    .single()
  if (error) throw error
  await writeAuditLog(req.user.id, `Input manual absensi ${tanggal} guru ${guru_id}`)
  res.status(201).json({ data, pesan: 'Data absensi tersimpan' })
}))

export default router
