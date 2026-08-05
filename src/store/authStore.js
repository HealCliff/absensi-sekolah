import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { setToken } from '../api/client'

const FOTO_KEY = 'absensi_user_foto'

function loadFoto() {
  try {
    return localStorage.getItem(FOTO_KEY) || ''
  } catch {
    return ''
  }
}

function saveFoto(foto) {
  try {
    if (foto) localStorage.setItem(FOTO_KEY, foto)
    else localStorage.removeItem(FOTO_KEY)
  } catch {
    // Abaikan jika penyimpanan tidak tersedia
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (nik, password) => {
        if (!/^\d{16}$/.test((nik || '').trim())) throw new Error('NIK harus 16 digit angka')
        if (!password) throw new Error('Password wajib diisi')

        const { token, user } = await authApi.login(nik.trim(), password)
        setToken(token)

        const userData = {
          id: user.id,
          nik: user.nik,
          role: user.role,
          nama: user.nama,
          isFirstLogin: user.isFirstLogin,
          guru_id: user.guru_id,
          foto: loadFoto(),
        }
        set({ user: userData, isAuthenticated: true })
        return userData
      },

      // Validasi sesi saat aplikasi dibuka (token masih valid?)
      restoreSession: async () => {
        try {
          const { user } = await authApi.me()
          set({
            user: { ...user, isFirstLogin: user.is_first_login, guru_id: user.guru_id, foto: loadFoto() },
            isAuthenticated: true,
          })
          return true
        } catch {
          set({ user: null, isAuthenticated: false })
          setToken('')
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        setToken('')
      },

      updateFirstLogin: (isFirstLogin) => {
        set((state) => ({
          user: state.user ? { ...state.user, isFirstLogin } : null,
        }))
      },

      updateProfileName: (nama) => {
        set((state) => ({
          user: state.user ? { ...state.user, nama } : null,
        }))
      },

      changePassword: async (password_lama, password_baru) => {
        await authApi.gantiPassword(password_lama, password_baru)
        set((state) => ({
          user: state.user ? { ...state.user, isFirstLogin: false } : null,
        }))
      },

      updateFoto: (foto) => {
        saveFoto(foto)
        set((state) => ({
          user: state.user ? { ...state.user, foto } : null,
        }))
      },
    }),
    {
      name: 'absensi_user',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
