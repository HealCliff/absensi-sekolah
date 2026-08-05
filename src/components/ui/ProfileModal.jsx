import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiUser, FiHash, FiShield, FiCheckCircle, FiKey } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useUsersStore } from '../../store/usersStore'
import { useNotificationStore } from '../../store/notificationStore'
import Modal from './Modal'
import Button from './Button'

const STATUS_META = {
  aktif: { label: 'Aktif', cls: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400' },
  nonaktif: { label: 'Nonaktif', cls: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400' },
  firstLogin: { label: 'Perlu Ganti Password', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' },
}

export default function ProfileModal({ open, onClose }) {
  const { user, updateFoto } = useAuthStore()
  const users = useUsersStore((state) => state.users)
  const showNotification = useNotificationStore((state) => state.showNotification)
  const navigate = useNavigate()
  const [preview, setPreview] = useState(user?.foto || '')

  if (!user) return null

  const currentUser = users.find((u) => u.id === user.id)
  const statusAktif = currentUser?.status_aktif !== false
  const status = !statusAktif ? STATUS_META.nonaktif : user.isFirstLogin ? STATUS_META.firstLogin : STATUS_META.aktif
  const initials = user.nama.split(' ').slice(0, 2).map((n) => n[0]).join('')

  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result
      if (base64) {
        setPreview(base64)
        updateFoto(base64)
        showNotification({ type: 'success', title: 'Foto profil diperbarui', message: 'Foto profil berhasil disimpan.' })
      }
    }
    reader.readAsDataURL(file)
  }

  const fields = [
    { icon: FiUser, label: 'Nama Lengkap', value: user.nama },
    { icon: FiHash, label: 'NIK', value: user.nik, mono: true },
    { icon: FiShield, label: 'Role', value: { guru: 'Guru', tata_usaha: 'Tata Usaha', kepala_sekolah: 'Kepala Sekolah' }[user.role] || '' },
    { icon: FiCheckCircle, label: 'Status Akun', value: status.label, badge: true },
  ]

  const handleGantiPassword = () => {
    onClose()
    navigate('/ganti-password')
  }

  return (
    <Modal open={open} onClose={onClose} title="Profil Saya">
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {preview ? (
              <img src={preview} alt="Profil" className="h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-blue-100 dark:ring-blue-500/20" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-bold text-white shadow-md ring-4 ring-blue-100 dark:ring-blue-500/20">
                {initials}
              </div>
            )}
            <label
              title="Ubah foto profil"
              className="group absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-700 text-white shadow-lg ring-2 ring-white transition-all hover:scale-110 hover:bg-blue-800 active:scale-95 dark:ring-gray-900"
            >
              <FiCamera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
            </label>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{user.nama}</h2>
          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${status.cls}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-gray-800">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                <field.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">{field.label}</p>
                {field.badge ? (
                  <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.cls}`}>{field.value}</span>
                ) : (
                  <p className={`mt-0.5 text-sm font-semibold text-slate-800 dark:text-white ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
            <FiKey className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Keamanan Akun</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Ganti password secara berkala agar akun tetap aman.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>Tutup</Button>
        <Button size="sm" onClick={handleGantiPassword}>Ganti Password</Button>
      </div>
    </Modal>
  )
}
