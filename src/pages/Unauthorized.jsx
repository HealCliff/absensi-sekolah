import { Link } from 'react-router-dom'
import { FiShieldOff, FiArrowLeft } from 'react-icons/fi'

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><FiShieldOff className="h-7 w-7" /></div>
        <p className="mt-5 text-sm font-semibold text-red-600">Kesalahan 403</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Akun Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan hubungi Tata Usaha.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"><FiArrowLeft className="h-4 w-4" /> Kembali ke Login</Link>
      </div>
    </main>
  )
}
