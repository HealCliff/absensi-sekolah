import test from 'node:test'
import assert from 'node:assert/strict'

function isHoliday(list, date) {
  return list.some((holiday) => holiday.tanggal
    ? holiday.tanggal === date
    : date >= holiday.tanggal_mulai && date <= holiday.tanggal_selesai)
}

test('tanggal libur satu hari terdeteksi', () => {
  assert.equal(isHoliday([{ tanggal: '2026-08-17' }], '2026-08-17'), true)
  assert.equal(isHoliday([{ tanggal: '2026-08-17' }], '2026-08-18'), false)
})

test('rentang hari libur terdeteksi termasuk batas awal dan akhir', () => {
  const holidays = [{ tanggal_mulai: '2026-08-20', tanggal_selesai: '2026-08-22' }]
  assert.equal(isHoliday(holidays, '2026-08-20'), true)
  assert.equal(isHoliday(holidays, '2026-08-21'), true)
  assert.equal(isHoliday(holidays, '2026-08-22'), true)
  assert.equal(isHoliday(holidays, '2026-08-23'), false)
})
