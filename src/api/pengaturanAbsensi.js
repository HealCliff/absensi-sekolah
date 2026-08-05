import { api } from './client'

export const pengaturanAbsensiApi = {
  get: () => api('/pengaturan-absensi'),
  update: (data) => api('/pengaturan-absensi', { method: 'PUT', body: data }),
}
