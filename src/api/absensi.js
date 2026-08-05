import { api } from './client'

export const absensiApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.tanggal) qs.set('tanggal', params.tanggal)
    if (params.mulai) qs.set('mulai', params.mulai)
    if (params.sampai) qs.set('sampai', params.sampai)
    if (params.guru_id) qs.set('guru_id', params.guru_id)
    if (params.status) qs.set('status', params.status)
    if (params.q) qs.set('q', params.q)
    if (params.page) qs.set('page', params.page)
    if (params.limit) qs.set('limit', params.limit)
    const query = qs.toString()
    return api(`/absensi${query ? `?${query}` : ''}`)
  },
  absen: (tipe, keterangan) => api('/absensi', { method: 'POST', body: { tipe, keterangan } }),
  koreksi: (id, data) => api(`/absensi/${id}`, { method: 'PUT', body: data }),
  manual: (data) => api('/absensi/manual', { method: 'POST', body: data }),
}
