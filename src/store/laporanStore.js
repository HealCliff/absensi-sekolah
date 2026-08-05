import { create } from 'zustand'
import { laporanApi } from '../api/laporan'

function tahunAjaranSekarang() {
  const sekarang = new Date()
  const tahunMulai = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1
  return `${tahunMulai}/${tahunMulai + 1}`
}

function buatPilihanTahunAjaran() {
  const [tahunMulai] = tahunAjaranSekarang().split('/').map(Number)
  return Array.from({ length: 4 }, (_, index) => {
    const mulai = tahunMulai - index
    const value = `${mulai}/${mulai + 1}`
    return { value, label: value }
  })
}

function tahunAjaranRange(tahunAjaran) {
  const [tahunMulai, tahunSelesai] = tahunAjaran.split('/').map(Number)
  return {
    mulai: `${tahunMulai}-07-01`,
    sampai: `${tahunSelesai}-06-30`,
  }
}

export function bulanRange(bulan) {
  const [tahun, nomorBulan] = bulan.split('-').map(Number)
  const hariTerakhir = new Date(tahun, nomorBulan, 0).getDate()
  return {
    mulai: `${bulan}-01`,
    sampai: `${bulan}-${String(hariTerakhir).padStart(2, '0')}`,
  }
}

export function formatBulan(bulan) {
  return new Date(`${bulan}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export const useLaporanStore = create((set, get) => ({
  tahunAjaran: tahunAjaranSekarang(),
  periodeLabel: `Tahun Ajaran ${tahunAjaranSekarang()}`,
  laporanData: [],
  loading: false,
  tahunAjaranOptions: buatPilihanTahunAjaran(),

  fetchLaporan: async (tahun) => {
    const ta = tahun || get().tahunAjaran
    const { mulai, sampai } = tahunAjaranRange(ta)
    set({ loading: true })
    try {
      const { data } = await laporanApi.rekap(mulai, sampai)
      set({ laporanData: data, tahunAjaran: ta, periodeLabel: `Tahun Ajaran ${ta}` })
      return data
    } finally {
      set({ loading: false })
    }
  },

  fetchLaporanRange: async (mulai, sampai, label) => {
    set({ loading: true })
    try {
      const { data } = await laporanApi.rekap(mulai, sampai)
      set({ laporanData: data, periodeLabel: label })
      return data
    } finally {
      set({ loading: false })
    }
  },

  setTahunAjaran: async (tahun) => {
    await get().fetchLaporan(tahun)
  },
}))
