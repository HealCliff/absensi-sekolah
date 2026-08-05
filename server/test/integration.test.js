import test from 'node:test'
import assert from 'node:assert/strict'
import dotenv from 'dotenv'

dotenv.config()

const enabled = process.env.RUN_INTEGRATION_TESTS === 'true'
const API_URL = process.env.API_URL || 'http://localhost:4000'
const TU_NIK = process.env.TEST_TU_NIK || '9876543210987654'
const TU_PASSWORD = process.env.TEST_TU_PASSWORD || 'tu12345'
const GURU_NIK = process.env.TEST_GURU_NIK || '1234567890123456'
const GURU_PASSWORD = process.env.TEST_GURU_PASSWORD || 'guru12345'
const KEPSEK_NIK = process.env.TEST_KEPSEK_NIK || '1111222233334444'
const KEPSEK_PASSWORD = process.env.TEST_KEPSEK_PASSWORD || 'kepsek12345'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

async function login(nik, password) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ nik, password }),
  })
  assert.equal(result.status, 200)
  assert.ok(result.body.token)
  return { Authorization: `Bearer ${result.body.token}` }
}

test('API health merespons tanpa autentikasi', { skip: !enabled }, async () => {
  const result = await request('/api/health')
  assert.equal(result.status, 200)
  assert.equal(result.body.status, 'ok')
})

test('endpoint absensi menolak request tanpa token', { skip: !enabled }, async () => {
  const result = await request('/api/absensi')
  assert.equal(result.status, 401)
})

test('TU dapat membaca pengaturan jam dan pagination absensi', { skip: !enabled }, async () => {
  const headers = await login(TU_NIK, TU_PASSWORD)
  const settings = await request('/api/pengaturan-absensi', { headers })
  assert.equal(settings.status, 200)
  assert.match(settings.body.data.jam_batas_masuk, /^\d{2}:\d{2}$/)
  assert.match(settings.body.data.jam_batas_pulang, /^\d{2}:\d{2}$/)

  const records = await request('/api/absensi?page=1&limit=1', { headers })
  assert.equal(records.status, 200)
  assert.ok(Array.isArray(records.body.data))
  assert.equal(records.body.pagination.page, 1)
  assert.equal(records.body.pagination.limit, 1)
  assert.ok(records.body.pagination.total >= records.body.data.length)
})

test('waktu server mengembalikan timezone sekolah', { skip: !enabled }, async () => {
  const result = await request('/api/waktu', { headers: await login(TU_NIK, TU_PASSWORD) })
  assert.equal(result.status, 200)
  assert.equal(result.body.data.timezone, 'Asia/Jakarta')
  assert.match(result.body.data.tanggal, /^\d{4}-\d{2}-\d{2}$/)
  assert.match(result.body.data.jam, /^\d{2}:\d{2}$/)
})

test('TU dapat memakai pagination data guru dan akun', { skip: !enabled }, async () => {
  const headers = await login(TU_NIK, TU_PASSWORD)
  const guru = await request('/api/guru?page=1&limit=1&status=aktif&q=Ahmad', { headers })
  assert.equal(guru.status, 200)
  assert.ok(Array.isArray(guru.body.data))
  assert.equal(guru.body.pagination.limit, 1)

  const users = await request('/api/users?page=1&limit=1&q=Siti', { headers })
  assert.equal(users.status, 200)
  assert.ok(Array.isArray(users.body.data))
  assert.equal(users.body.pagination.limit, 1)
})

test('guru tidak dapat mengakses data pengguna', { skip: !enabled }, async () => {
  const headers = await login(GURU_NIK, GURU_PASSWORD)
  const result = await request('/api/users', { headers })
  assert.equal(result.status, 403)
})

test('audit log hanya dapat diakses TU dan kepala sekolah', { skip: !enabled }, async () => {
  const tuResult = await request('/api/audit-log?page=1&limit=1', { headers: await login(TU_NIK, TU_PASSWORD) })
  assert.equal(tuResult.status, 200)
  assert.ok(Array.isArray(tuResult.body.data))

  const kepsekResult = await request('/api/audit-log?page=1&limit=1', { headers: await login(KEPSEK_NIK, KEPSEK_PASSWORD) })
  assert.equal(kepsekResult.status, 200)

  const guruResult = await request('/api/audit-log?page=1&limit=1', { headers: await login(GURU_NIK, GURU_PASSWORD) })
  assert.equal(guruResult.status, 403)
})

test('koreksi absensi menolak status tidak valid tanpa mengubah data', { skip: !enabled }, async () => {
  const headers = await login(TU_NIK, TU_PASSWORD)
  const records = await request('/api/absensi?page=1&limit=1', { headers })
  assert.ok(records.body.data.length > 0, 'test memerlukan minimal satu data absensi')

  const result = await request(`/api/absensi/${records.body.data[0].id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'status-salah' }),
  })
  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'Status absensi tidak valid')
})

test('input manual TU menolak status tidak valid tanpa mengubah data', { skip: !enabled }, async () => {
  const headers = await login(TU_NIK, TU_PASSWORD)
  const result = await request('/api/absensi/manual', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      guru_id: 1,
      tanggal: '2026-08-05',
      jam_masuk: '08:00',
      jam_pulang: '07:00',
      status: 'status-salah',
    }),
  })
  assert.equal(result.status, 400)
  assert.equal(result.body.message, 'Status absensi tidak valid')
})
