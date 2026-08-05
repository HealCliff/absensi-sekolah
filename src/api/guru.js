import { api } from './client'

export const guruApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.status) qs.set('status', params.status)
    if (params.page) qs.set('page', params.page)
    if (params.limit) qs.set('limit', params.limit)
    const query = qs.toString()
    return api(`/guru${query ? `?${query}` : ''}`)
  },
  get: (id) => api(`/guru/${id}`),
  create: (data) => api('/guru', { method: 'POST', body: data }),
  update: (id, data) => api(`/guru/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/guru/${id}`, { method: 'DELETE' }),
}
