import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { getToken } from './api/client'
import Login from './pages/Login'
import GantiPassword from './pages/GantiPassword'
import Forbidden from './pages/Forbidden'
import NotFound from './pages/NotFound'
import Profil from './pages/Profil'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import GuruDashboard from './pages/guru/GuruDashboard'
import Absensi from './pages/guru/Absensi'
import Riwayat from './pages/guru/Riwayat'
import TuDashboard from './pages/tu/TuDashboard'
import DataGuru from './pages/tu/DataGuru'
import ManajemenAkun from './pages/tu/ManajemenAkun'
import RekapAbsen from './pages/tu/RekapAbsen'
import HariLibur from './pages/tu/HariLibur'
import HakAkses from './pages/tu/HakAkses'
import PengaturanAbsensi from './pages/tu/PengaturanAbsensi'
import Laporan from './pages/Laporan'
import KepsekDashboard from './pages/kepsek/KepsekDashboard'
import ToastContainer from './components/ui/ToastContainer'
import AuditLog from './pages/AuditLog'

function RootRedirect() {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (user.isFirstLogin) return <Navigate to="/ganti-password" replace />
  const routes = { guru: '/guru/dashboard', tata_usaha: '/tu/dashboard', kepala_sekolah: '/kepsek/dashboard' }
  return <Navigate to={routes[user.role]} replace />
}

function SessionGuard() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    const onUnauthorized = () => {
      logout()
      navigate('/login')
    }
    window.addEventListener('absensi:unauthorized', onUnauthorized)

    if (getToken()) {
      restoreSession().catch(onUnauthorized)
    }

    return () => window.removeEventListener('absensi:unauthorized', onUnauthorized)
  }, [logout, restoreSession, navigate])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionGuard />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/ganti-password" element={<GantiPassword />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />

        <Route
          path="/guru"
          element={
            <ProtectedRoute roles={['guru']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<GuruDashboard />} />
          <Route path="absensi" element={<Absensi />} />
          <Route path="riwayat" element={<Riwayat />} />
        </Route>

        <Route
          path="/tu"
          element={
            <ProtectedRoute roles={['tata_usaha']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TuDashboard />} />
          <Route path="guru" element={<DataGuru />} />
          <Route path="manajemen-akun" element={<ManajemenAkun />} />
          <Route path="rekap" element={<RekapAbsen />} />
          <Route path="pengaturan-absensi" element={<PengaturanAbsensi />} />
          <Route path="hari-libur" element={<HariLibur />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="hak-akses" element={<HakAkses />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        <Route
          path="/kepsek"
          element={
            <ProtectedRoute roles={['kepala_sekolah']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<KepsekDashboard />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
