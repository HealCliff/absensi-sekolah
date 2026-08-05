import { create } from 'zustand'
import { waktuApi } from '../api/waktu'

export const useServerClockStore = create((set, get) => ({
  offsetMs: 0,
  timezone: 'Asia/Jakarta',
  loading: false,
  loaded: false,

  fetchServerTime: async () => {
    set({ loading: true })
    try {
      const requestedAt = Date.now()
      const { data } = await waktuApi.get()
      const receivedAt = Date.now()
      const networkMidpoint = requestedAt + Math.round((receivedAt - requestedAt) / 2)
      set({
        offsetMs: data.epochMs - networkMidpoint,
        timezone: data.timezone,
        loaded: true,
      })
      return data
    } finally {
      set({ loading: false })
    }
  },

  getNow: () => new Date(Date.now() + get().offsetMs),
}))
