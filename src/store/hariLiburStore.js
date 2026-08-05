import { create } from 'zustand'
import { hariLiburApi } from '../api/hariLibur'

export function isTanggalLibur(list, iso) {
  return list.some((l) => {
    if (l.tanggal) return l.tanggal === iso
    return iso >= l.tanggal_mulai && iso <= l.tanggal_selesai
  })
}

export function getKeteranganLibur(list, iso) {
  const found = list.find((l) => {
    if (l.tanggal) return l.tanggal === iso
    return iso >= l.tanggal_mulai && iso <= l.tanggal_selesai
  })
  return found?.keterangan || null
}

export const useHariLiburStore = create((set, get) => ({
  list: [],
  loading: false,

  fetchHariLibur: async () => {
    set({ loading: true })
    try {
      const { data } = await hariLiburApi.list()
      set({ list: data })
      return data
    } finally {
      set({ loading: false })
    }
  },

  addHariLibur: async (data) => {
    const { data: created } = await hariLiburApi.create({
      tanggal: data.tanggal || null,
      tanggal_mulai: data.tanggalMulai || data.tanggal_mulai || null,
      tanggal_selesai: data.tanggalSelesai || data.tanggal_selesai || null,
      keterangan: data.keterangan,
    })
    set({ list: [...get().list, created] })
    return created
  },

  updateHariLibur: async (id, data) => {
    const { data: updated } = await hariLiburApi.update(id, {
      tanggal: data.tanggal || null,
      tanggal_mulai: data.tanggalMulai || data.tanggal_mulai || null,
      tanggal_selesai: data.tanggalSelesai || data.tanggal_selesai || null,
      keterangan: data.keterangan,
    })
    set({ list: get().list.map((l) => (l.id === id ? updated : l)) })
    return updated
  },

  deleteHariLibur: async (id) => {
    await hariLiburApi.remove(id)
    set({ list: get().list.filter((l) => l.id !== id) })
  },

  isLibur: (iso) => isTanggalLibur(get().list, iso),
  getKeterangan: (iso) => getKeteranganLibur(get().list, iso),
}))
