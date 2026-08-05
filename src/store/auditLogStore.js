import { create } from 'zustand'
import { auditLogApi } from '../api/auditLog'

export const useAuditLogStore = create((set) => ({
  logs: [],
  pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
  loading: false,

  fetchLogs: async (params = {}) => {
    set({ loading: true })
    try {
      const result = await auditLogApi.list(params)
      set({ logs: result.data, pagination: result.pagination })
      return result
    } finally {
      set({ loading: false })
    }
  },
}))
