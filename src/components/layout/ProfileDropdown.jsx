import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiKey, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import ProfileModal from '../ui/ProfileModal'

export default function ProfileDropdown() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const roleLabel = { guru: 'Guru', tata_usaha: 'Tata Usaha', kepala_sekolah: 'Kepala Sekolah' }[user.role] || ''
  const initials = user.nama.split(' ').slice(0, 2).map((n) => n[0]).join('')
  const avatar = user.foto
    ? <img src={user.foto} alt={user.nama} className="h-8 w-8 rounded-full object-cover" />
    : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{initials}</div>

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleClick = (fn) => {
    fn()
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {avatar}
        <FiChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
            {user.foto ? (
              <img src={user.foto} alt={user.nama} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{initials}</div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-white">{user.nama}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <div className="space-y-1 p-2">
            <button
              onClick={() => { setOpen(false); setProfileOpen(true) }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <FiUser className="h-4 w-4" /> Lihat Profil
            </button>
            <button
              onClick={() => handleClick(() => navigate('/ganti-password'))}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <FiKey className="h-4 w-4" /> Ganti Password
            </button>
            <div className="border-t border-slate-200 dark:border-slate-700" />
            <button
              onClick={() => handleClick(handleLogout)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <FiLogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      )}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
