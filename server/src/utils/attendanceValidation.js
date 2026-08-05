const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/

export const ATTENDANCE_STATUSES = ['hadir', 'masuk', 'pulang', 'terlambat', 'izin', 'sakit', 'dinas', 'alpa', 'belum']

export function normaliseAttendanceTime(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const time = String(value)
  if (!TIME_PATTERN.test(time)) return false
  return time.slice(0, 5)
}

export function validateAttendanceFields({ status, jam_masuk, jam_pulang, keterangan }) {
  if (status !== undefined && !ATTENDANCE_STATUSES.includes(status)) {
    return 'Status absensi tidak valid'
  }

  if (jam_masuk === false) return 'Format jam masuk tidak valid'
  if (jam_pulang === false) return 'Format jam pulang tidak valid'
  if (jam_masuk && jam_pulang && jam_pulang < jam_masuk) {
    return 'Jam pulang tidak boleh lebih awal dari jam masuk'
  }
  if (keterangan !== undefined && keterangan !== null && String(keterangan).length > 255) {
    return 'Keterangan maksimal 255 karakter'
  }

  return null
}
