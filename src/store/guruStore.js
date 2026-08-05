import { create } from 'zustand'
import { guruApi } from '../api/guru'

export const useGuruStore = create((set, get) => ({
  guruList: [],
  pageGuruList: [],
  guruPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,

  fetchGuru: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await guruApi.list(params)
      set({ guruList: data })
      return data
    } finally {
      set({ loading: false })
    }
  },

  fetchGuruPage: async (params = {}) => {
    set({ loading: true })
    try {
      const result = await guruApi.list({ ...params, page: params.page || 1, limit: params.limit || 10 })
      set({ pageGuruList: result.data, guruPagination: result.pagination })
      return result
    } finally {
      set({ loading: false })
    }
  },

  addGuru: async (data) => {
    const { data: created } = await guruApi.create(data)
    set({ guruList: [...get().guruList, created] })
    return created
  },

  updateGuru: async (id, data) => {
    const { data: updated } = await guruApi.update(id, data)
    set({ guruList: get().guruList.map((g) => (g.id === id ? updated : g)) })
    return updated
  },

  deleteGuru: async (id) => {
    await guruApi.remove(id)
    set({ guruList: get().guruList.filter((g) => g.id !== id) })
  },
}))
