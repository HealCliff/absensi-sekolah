import test from 'node:test'
import assert from 'node:assert/strict'
import { getSchoolDateTime, SCHOOL_TIME_ZONE } from '../src/utils/time.js'

test('waktu absensi menggunakan timezone sekolah', () => {
  assert.equal(SCHOOL_TIME_ZONE, 'Asia/Jakarta')
  assert.deepEqual(getSchoolDateTime(new Date('2026-08-04T17:59:00.000Z')), {
    tanggal: '2026-08-05',
    jam: '00:59',
    jamDetik: '00:59:00',
  })
})

test('pergantian hari mengikuti tanggal Jakarta', () => {
  assert.deepEqual(getSchoolDateTime(new Date('2026-08-04T18:00:00.000Z')), {
    tanggal: '2026-08-05',
    jam: '01:00',
    jamDetik: '01:00:00',
  })
})
