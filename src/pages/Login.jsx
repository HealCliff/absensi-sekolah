import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiFileText, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [nik, setNik] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!nik.trim()) nextErrors.nik = 'NIK wajib diisi'
    else if (!/^\d{16}$/.test(nik.trim())) nextErrors.nik = 'NIK harus 16 digit angka'
    if (!password.trim()) nextErrors.password = 'Password wajib diisi'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    login(nik, password)
      .then((user) => {
        if (user.isFirstLogin) {
          navigate('/ganti-password', { replace: true })
          return
        }
        const routes = {
          guru: '/guru/dashboard',
          tata_usaha: '/tu/dashboard',
          kepala_sekolah: '/kepsek/dashboard',
        }
        navigate(routes[user.role], { replace: true })
      })
      .catch((err) => {
        setErrors({ form: err.message })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-blue-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-800"><FiCheckCircle className="h-6 w-6" /></div>
            <h1 className="mt-6 text-2xl font-bold">Sistem Absensi Guru</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">MTs SA Al-Barokah Ciambar</p>
          </div>

          <div className="my-12 space-y-5">
            <div className="flex gap-3"><FiClock className="mt-0.5 h-5 w-5 text-blue-200" /><div><p className="text-sm font-semibold">Pencatatan Kehadiran</p><p className="mt-1 text-xs leading-5 text-blue-200">Mencatat jam masuk dan pulang guru setiap hari.</p></div></div>
            <div className="flex gap-3"><FiUsers className="mt-0.5 h-5 w-5 text-blue-200" /><div><p className="text-sm font-semibold">Pengelolaan Data</p><p className="mt-1 text-xs leading-5 text-blue-200">Memudahkan Tata Usaha mengelola data kehadiran.</p></div></div>
            <div className="flex gap-3"><FiFileText className="mt-0.5 h-5 w-5 text-blue-200" /><div><p className="text-sm font-semibold">Laporan Absensi</p><p className="mt-1 text-xs leading-5 text-blue-200">Rekap harian dan bulanan untuk kebutuhan sekolah.</p></div></div>
          </div>

          <p className="text-xs text-blue-200">© {new Date().getFullYear()} MTs SA Al-Barokah Ciambar</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white"><FiCheckCircle className="h-6 w-6" /></div>
            <div><p className="font-bold text-slate-800">Sistem Absensi Guru</p><p className="text-xs text-slate-500">MTs SA Al-Barokah Ciambar</p></div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Masuk ke Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">Silakan masukkan NIK dan password Anda.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">NIK</label>
              <input type="text" inputMode="numeric" value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))} placeholder="Masukkan NIK 16 digit" maxLength="16" className={`w-full rounded-md border px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${errors.nik ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15'}`} />
              {errors.nik && <p className="mt-1 text-xs text-red-600">{errors.nik}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className={`w-full rounded-md border py-2.5 pl-3.5 pr-11 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {errors.form && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

        </section>
      </div>
    </main>
  )
}
