import { create } from 'zustand'
import { pengaturanAbsensiApi } from '../api/pengaturanAbsensi'

const DEFAULTS = {
  jamBatasMasuk: '07:15',
  jamBatasPulang: '13:00',
}

function mapData(data) {
  return {
    jamBatasMasuk: data.jam_batas_masuk,
    jamBatasPulang: data.jam_batas_pulang,
  }
}

export const usePengaturanAbsensiStore = create((set) => ({
  ...DEFAULTS,
  loaded: false,
  loading: false,
  saving: false,

  fetchPengaturan: async () => {
    set({ loading: true })
    try {
      const { data } = await pengaturanAbsensiApi.get()
      set({ ...mapData(data), loaded: true })
      return data
    } finally {
      set({ loading: false })
    }
  },

  updatePengaturan: async (data) => {
    set({ saving: true })
    try {
      const { data: updated } = await pengaturanAbsensiApi.update({
        jam_batas_masuk: data.jamBatasMasuk,
        jam_batas_pulang: data.jamBatasPulang,
      })
      set({ ...mapData(updated), loaded: true })
      return updated
    } finally {
      set({ saving: false })
    }
  },
}))
