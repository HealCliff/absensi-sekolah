import { create } from 'zustand'
import { absensiApi } from '../api/absensi'

export const useAttendanceStore = create((set, get) => ({
  records: [],
  recapRecords: [],
  recapPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,

  fetchRecords: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await absensiApi.list(params)
      set({ records: data })
      return data
    } finally {
      set({ loading: false })
    }
  },

  fetchRecapRecords: async (params = {}) => {
    set({ loading: true })
    try {
      const { data, pagination } = await absensiApi.list({ ...params, page: params.page || 1, limit: params.limit || 10 })
      set({ recapRecords: data, recapPagination: pagination })
      return data
    } finally {
      set({ loading: false })
    }
  },

  recordAttendance: async ({ tipe, keterangan }) => {
    const { data } = await absensiApi.absen(tipe, keterangan)
    const records = get().records
    const idx = records.findIndex((r) => r.guru_id === data.guru_id && r.tanggal === data.tanggal)
    let next
    if (idx === -1) next = [...records, data]
    else next = records.map((r, i) => (i === idx ? data : r))
    set({ records: next })
    return data
  },

  addManualRecord: async (record) => {
    const { data } = await absensiApi.manual(record)
    set({
      records: [...get().records.filter((item) => item.id !== data.id), data],
      recapRecords: [...get().recapRecords.filter((item) => item.id !== data.id), data],
    })
    return data
  },

  updateRecord: async (id, updates) => {
    const { data } = await absensiApi.koreksi(id, updates)
    set({
      records: get().records.map((r) => (r.id === id ? data : r)),
      recapRecords: get().recapRecords.map((r) => (r.id === id ? data : r)),
    })
    return data
  },

  resetRecords: async () => {
    await get().fetchRecords()
  },
}))
