/* global process */

const API_URL = process.env.API_URL || 'http://localhost:4000'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174'
const NIK = process.env.PREFLIGHT_NIK || '9876543210987654'
const PASSWORD = process.env.PREFLIGHT_PASSWORD || 'tu12345'
const results = []

async function get(path, headers = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers })
  const body = await response.json().catch(() => null)
  return { response, body }
}

async function check(label, callback) {
  try {
    await callback()
    results.push({ label, ok: true })
  } catch (error) {
    results.push({ label, ok: false, message: error.message })
  }
}

await check('Frontend dapat diakses', async () => {
  const response = await fetch(`${FRONTEND_URL}/login`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
})

await check('Backend health', async () => {
  const { response, body } = await get('/api/health')
  if (!response.ok || body?.status !== 'ok') throw new Error(`HTTP ${response.status}`)
})

let headers
let serverTime

await check('Login akun TU', async () => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nik: NIK, password: PASSWORD }),
  })
  const body = await response.json()
  if (!response.ok || !body.token || body.user?.role !== 'tata_usaha') throw new Error(`HTTP ${response.status}`)
  headers = { Authorization: `Bearer ${body.token}` }
})

if (headers) {
  await check('Waktu server dan database', async () => {
    const result = await get('/api/waktu', headers)
    if (!result.response.ok || !result.body?.data?.timezone) throw new Error(`HTTP ${result.response.status}`)
    serverTime = result.body.data
  })

  await check('Pengaturan jam absensi', async () => {
    const { response, body } = await get('/api/pengaturan-absensi', headers)
    if (!response.ok || !body?.data?.jam_batas_masuk || !body?.data?.jam_batas_pulang) throw new Error(`HTTP ${response.status}`)
  })

  await check('Rekap absensi', async () => {
    const year = Number(serverTime.tanggal.slice(0, 4))
    const month = Number(serverTime.tanggal.slice(5, 7))
    const mulai = `${month >= 7 ? year : year - 1}-07-01`
    const sampai = `${month >= 7 ? year + 1 : year}-06-30`
    const { response, body } = await get(`/api/laporan/rekap?mulai=${mulai}&sampai=${sampai}`, headers)
    if (!response.ok || !Array.isArray(body?.data)) throw new Error(`HTTP ${response.status}`)
  })

  await check('Audit log', async () => {
    const { response, body } = await get('/api/audit-log?page=1&limit=1', headers)
    if (!response.ok || !Array.isArray(body?.data)) throw new Error(`HTTP ${response.status}`)
  })
}

for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.label}${result.message ? ` — ${result.message}` : ''}`)
}

const failed = results.filter((result) => !result.ok)
if (failed.length > 0) process.exitCode = 1
