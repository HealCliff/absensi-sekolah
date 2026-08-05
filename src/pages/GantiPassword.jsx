import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiShield, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import Button from '../components/ui/Button'

const STRENGTH_META = [
  { label: '', cls: '', width: '0%' },
  { label: 'Lemah', cls: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', width: '33%' },
  { label: 'Sedang', cls: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', width: '66%' },
  { label: 'Kuat', cls: 'text-green-600 dark:text-green-400', bar: 'bg-green-500', width: '100%' },
]

function strengthScore(pw) {
  let score = 0
  if (pw.length >= 8) score += 1
  if (/[A-Z]/.test(pw)) score += 1
  if (/\d/.test(pw)) score += 1
  return score
}

export default function GantiPassword() {
  const { user, changePassword } = useAuthStore()
  const { showNotification } = useNotificationStore()
  const navigate = useNavigate()

  const isFirstLogin = !!user?.isFirstLogin

  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const strength = STRENGTH_META[passwordBaru ? strengthScore(passwordBaru) : 0]
  const matches = passwordBaru && konfirmasi ? passwordBaru === konfirmasi : null

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}

    if (!isFirstLogin) {
      if (!passwordLama) nextErrors.passwordLama = 'Password lama wajib diisi'
    }
    if (!passwordBaru) nextErrors.passwordBaru = 'Password baru wajib diisi'
    else if (passwordBaru.length < 8) nextErrors.passwordBaru = 'Password baru minimal 8 karakter'
    else if (strengthScore(passwordBaru) === 0) nextErrors.passwordBaru = 'Password terlalu lemah, gunakan huruf besar dan angka'
    if (!konfirmasi) nextErrors.konfirmasi = 'Konfirmasi password wajib diisi'
    else if (passwordBaru !== konfirmasi) nextErrors.konfirmasi = 'Password baru dan konfirmasi tidak cocok'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    changePassword(passwordLama, passwordBaru)
      .then(() => {
        showNotification({ type: 'success', title: 'Password berhasil diubah', message: 'Password Anda telah diperbarui.' })
        const routes = { guru: '/guru/dashboard', tata_usaha: '/tu/dashboard', kepala_sekolah: '/kepsek/dashboard' }
        navigate(routes[user.role], { replace: true })
      })
      .catch((err) => {
        setErrors({ form: err.message })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const inputCls = (hasError) => `w-full rounded-lg border bg-white py-2.5 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors focus:ring-2 dark:bg-gray-900 dark:text-white ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15 dark:border-gray-700'}`
  const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'

  const renderField = (id, label, value, setValue, show, setShow, placeholder, error, mono = false) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <FiLock className={iconCls} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputCls(!!error)} ${mono ? 'font-mono' : ''}`}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300" aria-label="Tampilkan atau sembunyikan password">
          {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"><FiAlertTriangle className="h-3.5 w-3.5" /> {error}</p>}
    </div>
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md animate-modal-in">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400">
          <FiArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                <FiShield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Ganti Password</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
                  {isFirstLogin ? 'Anda wajib mengganti password saat login pertama.' : 'Ganti password Anda secara berkala agar akun tetap aman.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6" noValidate>
            {isFirstLogin && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Untuk keamanan akun Anda, silakan buat password baru minimal 8 karakter.</p>
              </div>
            )}

            {!isFirstLogin && renderField('password-lama', 'Password Lama', passwordLama, setPasswordLama, showOld, setShowOld, 'Masukkan password lama Anda', errors.passwordLama)}

            <div>
              {renderField('password-baru', 'Password Baru', passwordBaru, setPasswordBaru, showNew, setShowNew, 'Minimal 8 karakter, gabungan huruf dan angka', errors.passwordBaru, true)}
              {passwordBaru && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < strengthScore(passwordBaru) ? strength.bar : 'bg-slate-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className={`mt-1 text-xs font-medium ${strength.cls}`}>Kekuatan password: {strength.label}</p>
                </div>
              )}
            </div>

            <div>
              {renderField('konfirmasi', 'Konfirmasi Password Baru', konfirmasi, setKonfirmasi, showConfirm, setShowConfirm, 'Ulangi password baru Anda', errors.konfirmasi, true)}
              {matches === true && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><FiCheck className="h-3.5 w-3.5" /> Password baru dan konfirmasi cocok</p>
              )}
            </div>

            {errors.form && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{errors.form}</div>}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Memproses...' : 'Simpan Password'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
