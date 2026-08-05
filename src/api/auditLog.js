import { api } from './client'

export const auditLogApi = {
  list: ({ page = 1, limit = 25, q = '' } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (q) params.set('q', q)
    return api(`/audit-log?${params.toString()}`)
  },
}
