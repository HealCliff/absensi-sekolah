import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiLogOut, FiMenu, FiX, FiHome, FiClock, FiCalendar, FiUsers, FiEdit3, FiFileText, FiShield, FiSun, FiMoon, FiUserPlus, FiCalendar as FiCalendarAlt, FiSettings, FiActivity } from 'react-icons/fi'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useLoadData } from '../../hooks/useLoadData'
import ProfileDropdown from './ProfileDropdown'

const MENU = {
  guru: [
    { to: '/guru/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/guru/absensi', label: 'Absensi', icon: FiClock },
    { to: '/guru/riwayat', label: 'Riwayat Absensi', icon: FiCalendar },
  ],
  tata_usaha: [
    { to: '/tu/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/tu/guru', label: 'Data Guru', icon: FiUsers },
    { to: '/tu/manajemen-akun', label: 'Manajemen Akun', icon: FiUserPlus },
    { to: '/tu/rekap', label: 'Rekap Absen', icon: FiEdit3 },
    { to: '/tu/pengaturan-absensi', label: 'Jam Absensi', icon: FiSettings },
    { to: '/tu/hari-libur', label: 'Hari Libur', icon: FiCalendarAlt },
    { to: '/tu/laporan', label: 'Laporan', icon: FiFileText },
    { to: '/tu/hak-akses', label: 'Hak Akses', icon: FiShield },
    { to: '/tu/audit-log', label: 'Audit Log', icon: FiActivity },
  ],
  kepala_sekolah: [
    { to: '/kepsek/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/kepsek/laporan', label: 'Laporan', icon: FiFileText },
    { to: '/kepsek/audit-log', label: 'Audit Log', icon: FiActivity },
  ],
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useLoadData()

  if (!user) return null
  const menu = MENU[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-white">Sistem Absensi</p>
          <p className="truncate text-xs text-slate-500 dark:text-gray-400">MTs SA Al-Barokah</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu Utama</p>
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/guru/dashboard' || item.to === '/tu/dashboard' || item.to === '/kepsek/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-3 dark:border-gray-800">
        <ProfileDropdown />
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            aria-label="Keluar"
            title="Keluar"
          >
            <FiLogOut className="h-4 w-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            title={isDark ? 'Mode terang' : 'Mode gelap'}
          >
            {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 lg:block dark:border-gray-800">{SidebarContent}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-4 z-10 rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Tutup menu"><FiX className="h-5 w-5" /></button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"><FiMenu className="h-5 w-5" /></button>
          <p className="ml-3 text-sm font-semibold text-slate-800 dark:text-white">Sistem Absensi Guru</p>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
