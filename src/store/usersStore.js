import { create } from 'zustand'
import { usersApi } from '../api/users'

export const useUsersStore = create((set, get) => ({
  users: [],
  pageUsers: [],
  usersPagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  loading: false,

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const { data } = await usersApi.list()
      set({ users: data })
      return data
    } finally {
      set({ loading: false })
    }
  },

  fetchUsersPage: async (params = {}) => {
    set({ loading: true })
    try {
      const result = await usersApi.list({ ...params, page: params.page || 1, limit: params.limit || 10 })
      set({ pageUsers: result.data, usersPagination: result.pagination })
      return result
    } finally {
      set({ loading: false })
    }
  },

  changeRole: async (userId, role) => {
    const { data } = await usersApi.changeRole(userId, role)
    set({ users: get().users.map((u) => (u.id === userId ? data : u)) })
    return get().users
  },

  addUser: async (data) => {
    const res = await usersApi.create(data)
    set({ users: [...get().users, res.data] })
    return { users: get().users, password: res.password }
  },

  toggleStatus: async (userId) => {
    const user = get().users.find((u) => u.id === userId)
    if (!user) return get().users
    const nextStatus = !user.status_aktif
    const { data } = await usersApi.toggleStatus(userId, nextStatus)
    set({ users: get().users.map((u) => (u.id === userId ? data : u)) })
    return get().users
  },

  resetPassword: async (userId) => {
    const res = await usersApi.resetPassword(userId)
    set({ users: get().users.map((u) => (u.id === userId ? res.data : u)) })
    return { users: get().users, password: res.password }
  },

  updatePassword: async (userId) => {
    set({ users: get().users.map((u) => (u.id === userId ? { ...u, is_first_login: false } : u)) })
    return get().users
  },

  deleteUser: async (userId) => {
    await usersApi.remove(userId)
    set({ users: get().users.filter((u) => u.id !== userId) })
    return get().users
  },
}))
