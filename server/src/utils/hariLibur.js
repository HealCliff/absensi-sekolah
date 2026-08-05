import { db } from '../config/db.js'

export async function getHariLibur(tanggal) {
  const { data, error } = await db
    .from('hari_libur')
    .select('tanggal, tanggal_mulai, tanggal_selesai, keterangan')

  if (error) throw error
  return data.find((hari) => {
    if (hari.tanggal) return hari.tanggal === tanggal
    return tanggal >= hari.tanggal_mulai && tanggal <= hari.tanggal_selesai
  }) || null
}
