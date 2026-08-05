import { create } from 'zustand'

const STORAGE_KEY = 'absensi_theme'

function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark'
  } catch {
    return false
  }
}

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

// Inisialisasi sekali saat store pertama dibuat
applyTheme(loadTheme())

export const useThemeStore = create((set, get) => ({
  isDark: loadTheme(),

  toggleTheme: () => {
    const next = !get().isDark
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    applyTheme(next)
    set({ isDark: next })
  },
}))
