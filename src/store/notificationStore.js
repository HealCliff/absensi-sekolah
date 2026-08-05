import { create } from 'zustand'

let nextId = 1

export const useNotificationStore = create((set) => ({
  notifications: [],

  showNotification: ({ type = 'success', title, message, duration = 4000 }) => {
    const id = nextId++
    set((state) => ({
      notifications: [...state.notifications, { id, type, title, message }],
    }))

    if (duration > 0) {
      window.setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
        }))
      }, duration)
    }

    return id
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }))
  },
}))
