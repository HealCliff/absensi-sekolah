import { api } from './client'

export const usersApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.page) qs.set('page', params.page)
    if (params.limit) qs.set('limit', params.limit)
    const query = qs.toString()
    return api(`/users${query ? `?${query}` : ''}`)
  },
  create: (data) => api('/users', { method: 'POST', body: data }),
  changeRole: (id, role) => api(`/users/${id}/role`, { method: 'PUT', body: { role } }),
  toggleStatus: (id, status_aktif) => api(`/users/${id}/status`, { method: 'PATCH', body: { status_aktif } }),
  resetPassword: (id) => api(`/users/${id}/reset-password`, { method: 'POST' }),
  remove: (id) => api(`/users/${id}`, { method: 'DELETE' }),
}
