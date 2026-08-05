import { api } from './client'

export const waktuApi = {
  get: () => api('/waktu'),
}
