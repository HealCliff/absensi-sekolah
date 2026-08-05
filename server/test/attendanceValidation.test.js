import test from 'node:test'
import assert from 'node:assert/strict'
import { normaliseAttendanceTime, validateAttendanceFields } from '../src/utils/attendanceValidation.js'

test('normaliseAttendanceTime menerima HH:mm dan HH:mm:ss', () => {
  assert.equal(normaliseAttendanceTime('07:15'), '07:15')
  assert.equal(normaliseAttendanceTime('07:15:30'), '07:15')
  assert.equal(normaliseAttendanceTime(null), null)
})

test('normaliseAttendanceTime menolak format waktu tidak valid', () => {
  assert.equal(normaliseAttendanceTime('25:00'), false)
  assert.equal(normaliseAttendanceTime('07.15'), false)
})

test('validasi absensi menerima data yang benar', () => {
  assert.equal(validateAttendanceFields({
    status: 'hadir',
    jam_masuk: '07:00',
    jam_pulang: '13:00',
    keterangan: 'Tepat waktu',
  }), null)
})

test('validasi absensi menolak status dan rentang jam yang salah', () => {
  assert.equal(validateAttendanceFields({ status: 'status-salah' }), 'Status absensi tidak valid')
  assert.equal(validateAttendanceFields({ jam_masuk: '10:00', jam_pulang: '09:00' }), 'Jam pulang tidak boleh lebih awal dari jam masuk')
})

test('validasi absensi membatasi keterangan', () => {
  assert.equal(validateAttendanceFields({ keterangan: 'a'.repeat(256) }), 'Keterangan maksimal 255 karakter')
})
