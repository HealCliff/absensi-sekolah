import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiArrowLeft, FiUser, FiHash, FiShield, FiCheckCircle, FiKey } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useUsersStore } from '../store/usersStore'
import { useNotificationStore } from '../store/notificationStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const STATUS_META = {
  aktif: { label: 'Aktif', cls: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400' },
  nonaktif: { label: 'Nonaktif', cls: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400' },
  firstLogin: { label: 'Perlu Ganti Password', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' },
}

export default function Profil() {
  const { user, updateFoto } = useAuthStore()
  const users = useUsersStore((state) => state.users)
  const showNotification = useNotificationStore((state) => state.showNotification)
  const navigate = useNavigate()
  const roleLabel = { guru: 'Guru', tata_usaha: 'Tata Usaha', kepala_sekolah: 'Kepala Sekolah' }[user?.role] || ''
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
    { icon: FiShield, label: 'Role', value: roleLabel },
    { icon: FiCheckCircle, label: 'Status Akun', value: status.label, badge: true },
  ]

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <FiArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <header className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Informasi akun dan keamanan Anda</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card className="animate-fade-in-up overflow-hidden">
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="relative">
              {preview ? (
                <img src={preview} alt="Profil" className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-blue-100 transition-transform duration-200 hover:scale-[1.03] dark:ring-blue-500/20" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white shadow-md ring-4 ring-blue-100 transition-transform duration-200 hover:scale-[1.03] dark:ring-blue-500/20">
                  {initials}
                </div>
              )}
              <label
                title="Ubah foto profil"
                className="group absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-700 text-white shadow-lg ring-2 ring-white transition-all hover:scale-110 hover:bg-blue-800 active:scale-95 dark:ring-gray-900"
              >
                <FiCamera className="h-4 w-4 transition-transform group-hover:scale-110" />
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
              </label>
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{user.nama}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{roleLabel}</p>

            <div className="mt-5 flex w-full items-center justify-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${status.cls}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Detail Akun" subtitle="Informasi pribadi akun Anda" className="animate-fade-in-up">
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {fields.map((field) => (
              <div key={field.label} className="flex items-center gap-4 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <field.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">{field.label}</p>
                  {field.badge ? (
                    <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.cls}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {field.value}
                    </span>
                  ) : (
                    <p className={`mt-1 text-sm font-semibold text-slate-800 dark:text-white ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="animate-fade-in-up overflow-hidden">
        <div className="flex flex-col items-start gap-4 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <FiKey className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Keamanan Akun</p>
              <p className="mt-0.5 text-sm text-blue-100">Ganti password secara berkala agar akun tetap aman.</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/ganti-password')}
            className="shrink-0 border-white bg-white text-blue-800 shadow-sm hover:bg-blue-50"
          >
            Ganti Password
          </Button>
        </div>
      </Card>
    </div>
  )
}
