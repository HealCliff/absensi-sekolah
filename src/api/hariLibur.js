import { api } from './client'

export const hariLiburApi = {
  list: () => api('/hari-libur'),
  create: (data) => api('/hari-libur', { method: 'POST', body: data }),
  update: (id, data) => api(`/hari-libur/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/hari-libur/${id}`, { method: 'DELETE' }),
}
