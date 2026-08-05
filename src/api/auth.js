import { api } from './client'

export const authApi = {
  login: (nik, password) => api('/auth/login', { method: 'POST', body: { nik, password } }),
  me: () => api('/auth/me'),
  gantiPassword: (password_lama, password_baru) =>
    api('/auth/ganti-password', { method: 'POST', body: { password_lama, password_baru } }),
}
