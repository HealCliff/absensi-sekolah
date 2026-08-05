
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiLogIn, FiLogOut, FiCalendar, FiArrowRight, FiSun } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { formatTanggal, isTerlambat } from '../../data/absensiData'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useHariLiburStore } from '../../store/hariLiburStore'
import { usePengaturanAbsensiStore } from '../../store/pengaturanAbsensiStore'
import { useServerClock } from '../../hooks/useServerClock'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function GuruDashboard() {
  const { user } = useAuthStore()
  const allAbsensi = useAttendanceStore((state) => state.records)
  const liburKeterangan = useHariLiburStore((state) => state.getKeterangan)
  const jamBatasMasuk = usePengaturanAbsensiStore((state) => state.jamBatasMasuk)
  const fetchPengaturan = usePengaturanAbsensiStore((state) => state.fetchPengaturan)

  useEffect(() => {
    fetchPengaturan().catch(() => {})
  }, [fetchPengaturan])
  const now = useServerClock()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = allAbsensi.find((a) => a.guru_id === user.guru_id && a.tanggal === todayISO)
  const monthRows = allAbsensi.filter((a) => a.guru_id === user.guru_id && a.tanggal.startsWith(todayISO.slice(0, 7)))
  const stats = {
    hadir: monthRows.filter((a) => a.status === 'hadir' || a.status === 'pulang' || a.status === 'masuk').length,
    terlambat: monthRows.filter((a) => a.status === 'terlambat').length,
    izin: monthRows.filter((a) => a.status === 'izin').length,
    sakit: monthRows.filter((a) => a.status === 'sakit').length,
    alpa: monthRows.filter((a) => a.status === 'alpa').length,
  }
  const recent = monthRows.slice(-5).reverse()

  const hariLibur = liburKeterangan(todayISO)

  return (
    <div className="space-y-6">
      {hariLibur && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <FiSun className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Hari ini libur: {hariLibur}</p>
        </div>
      )}
      <PageHeader
        title="Dashboard Guru"
        subtitle={`${formatTanggal(todayISO)} — Selamat datang, ${user.nama}`}
        action={
          <Link to="/guru/absensi" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
            <FiClock className="h-4 w-4" /> Absen Sekarang
          </Link>
        }
      />

      <Card title="Status Absensi Hari Ini" subtitle={formatTanggal(todayISO)}>
        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_1fr] md:items-center">
          <div className="flex items-center gap-4 md:border-r md:border-slate-200 md:pr-5 dark:border-gray-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"><FiClock className="h-6 w-6" /></div>
            <div>
              <p className="mb-2 text-sm text-slate-500 dark:text-gray-400">Status kehadiran</p>
              <StatusBadge status={today?.status || 'belum'} />
            </div>
          </div>
          <div className="md:border-r md:border-slate-200 md:px-5 dark:border-gray-800">
            <p className="text-sm text-slate-500 dark:text-gray-400">Jam Masuk</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-800 dark:text-white">{today?.jam_masuk || '--:--'}</p>
            {today?.jam_masuk && <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{isTerlambat(today.jam_masuk, jamBatasMasuk) ? 'Terlambat' : 'Tepat waktu'}</p>}
          </div>
          <div className="md:pl-5">
            <p className="text-sm text-slate-500 dark:text-gray-400">Jam Pulang</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-800 dark:text-white">{today?.jam_pulang || '--:--'}</p>
            <Link to="/guru/absensi" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">Buka halaman absensi <FiArrowRight /></Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<FiLogIn className="h-5 w-5" />} label="Hadir" value={stats.hadir} color="navy" />
        <StatCard icon={<FiClock className="h-5 w-5" />} label="Terlambat" value={stats.terlambat} color="amber" />
        <StatCard icon={<FiCalendar className="h-5 w-5" />} label="Izin" value={stats.izin} color="blue" />
        <StatCard icon={<FiLogOut className="h-5 w-5" />} label="Sakit" value={stats.sakit} color="purple" />
      </div>

      <Card title="Riwayat Absensi Terakhir" action={<Link to="/guru/riwayat" className="text-sm font-medium text-blue-700 hover:text-blue-800">Lihat Semua</Link>} noPadding>
        <div className="divide-y divide-slate-100 dark:divide-gray-800 sm:hidden">
          {recent.map((a) => (
            <div key={a.id} className="p-4">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatTanggal(a.tanggal)}</p><StatusBadge status={a.status} /></div>
              <div className="mt-3 flex gap-6 text-xs text-slate-500 dark:text-gray-400"><span>Masuk <strong className="ml-1 font-mono text-slate-700 dark:text-slate-200">{a.jam_masuk || '-'}</strong></span><span>Pulang <strong className="ml-1 font-mono text-slate-700 dark:text-slate-200">{a.jam_pulang || '-'}</strong></span></div>
            </div>
          ))}
          {recent.length === 0 && <EmptyState icon={FiCalendar} title="Belum ada data absensi bulan ini" />}
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-gray-800/40"><tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-gray-800 dark:text-slate-400"><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Jam Masuk</th><th className="px-5 py-3 font-medium">Jam Pulang</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
            <tbody>
              {recent.map((a) => <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-gray-800 dark:hover:bg-gray-800/50"><td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{formatTanggal(a.tanggal)}</td><td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{a.jam_masuk || '-'}</td><td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{a.jam_pulang || '-'}</td><td className="px-5 py-3"><StatusBadge status={a.status} /></td></tr>)}
              {recent.length === 0 && <tr><td colSpan={4} className="p-0"><EmptyState icon={FiCalendar} title="Belum ada data absensi bulan ini" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
