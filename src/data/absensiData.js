// Generator data absensi mock — tanggal relatif ke hari ini supaya data selalu "segar"
import { GURU, JAM_BATAS_MASUK } from './mockData.js'

// Helper tanggal
function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isWeekend(d) {
  const day = d.getDay()
  return day === 0 || day === 6
}

// Generate absensi utk rentang tanggal (default: awal bulan ini - hari ini)
export function generateAbsensi() {
  const rows = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const statuses = ['hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'terlambat', 'izin', 'sakit']
  const jamMasukList = ['06:45', '06:50', '06:55', '07:00', '07:05', '07:10']
  const jamMasukTelat = ['07:20', '07:25', '07:30', '07:40']

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (isWeekend(d)) continue
    const tanggal = toISO(d)
    const isToday = tanggal === toISO(now)

    for (const guru of GURU) {
      if (!guru.status_aktif) continue

      let status
      if (isToday) {
        // Hari ini: sebagian sudah absen, sebagian belum (biar dashboard TU ada yg "belum absen")
        const idx = guru.id % 5
        status = idx === 0 ? 'belum' : idx === 1 ? 'masuk' : idx === 2 ? 'masuk' : idx === 3 ? 'pulang' : 'terlambat'
      } else {
        status = statuses[Math.floor(Math.random() * statuses.length)]
      }

      let jamMasuk = null
      let jamPulang = null
      let keterangan = null

      if (status === 'hadir') {
        jamMasuk = jamMasukList[Math.floor(Math.random() * jamMasukList.length)]
        jamPulang = '14:30'
      } else if (status === 'terlambat') {
        jamMasuk = jamMasukTelat[Math.floor(Math.random() * jamMasukTelat.length)]
        jamPulang = '14:30'
      } else if (status === 'masuk') {
        jamMasuk = jamMasukList[Math.floor(Math.random() * jamMasukList.length)]
      } else if (status === 'izin') {
        keterangan = 'Izin keperluan keluarga'
      } else if (status === 'sakit') {
        keterangan = 'Sakit'
      }

      rows.push({
        id: rows.length + 1,
        guru_id: guru.id,
        tanggal,
        jam_masuk: jamMasuk,
        jam_pulang: jamPulang,
        status,
        keterangan,
        dikoreksi_oleh: null,
      })
    }
  }
  return rows
}

// Status label + warna (konsisten di semua halaman)
export const STATUS_META = {
  hadir: { label: 'Hadir', cls: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  terlambat: { label: 'Terlambat', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  izin: { label: 'Izin', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  sakit: { label: 'Sakit', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  dinas: { label: 'Dinas', cls: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400' },
  alpa: { label: 'Alpa', cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  belum: { label: 'Belum Absen', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  masuk: { label: 'Masuk', cls: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  pulang: { label: 'Pulang', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
}

// Cek apakah jam masuk melewati batas → terlambat
export function isTerlambat(jam, batas = JAM_BATAS_MASUK) {
  if (!jam) return false
  return jam > batas
}

export function formatTanggal(iso) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${parseInt(d)} ${bulan[parseInt(m) - 1]} ${y}`
}

export function formatTanggalPendek(iso) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${parseInt(d)}/${parseInt(m)}/${y}`
}
