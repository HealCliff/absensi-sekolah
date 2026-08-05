import { api } from './client'

export const laporanApi = {
  rekap: (mulai, sampai) => api(`/laporan/rekap?mulai=${mulai}&sampai=${sampai}`),
  harian: (tanggal) => api(`/laporan/harian?tanggal=${tanggal}`),
}
