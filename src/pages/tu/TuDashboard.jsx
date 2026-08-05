
import { FiUsers, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { formatTanggal } from '../../data/absensiData'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useGuruStore } from '../../store/guruStore'
import { useServerClock } from '../../hooks/useServerClock'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'

export default function TuDashboard() {
  const { user } = useAuthStore()
  const allAbsensi = useAttendanceStore((state) => state.records)
  const guruList = useGuruStore((state) => state.guruList)

  const now = useServerClock()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const activeGuru = guruList.filter((g) => g.status_aktif)
  const todayRows = allAbsensi.filter((a) => a.tanggal === todayISO)

  const totalGuru = activeGuru.length
  const hadir = todayRows.filter((a) => ['hadir', 'terlambat', 'masuk', 'pulang'].includes(a.status)).length
  const terlambat = todayRows.filter((a) => a.status === 'terlambat').length
  const belum = totalGuru - todayRows.filter((a) => a.status !== 'belum').length

  // Data 7 hari terakhir utk chart (hari kerja)
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const day = d.getDay()
    if (day === 0 || day === 6) continue
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayRows = allAbsensi.filter((a) => a.tanggal === iso)
    chartData.push({
      nama: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      Hadir: dayRows.filter((a) => ['hadir', 'pulang', 'masuk'].includes(a.status)).length,
      Terlambat: dayRows.filter((a) => a.status === 'terlambat').length,
      Izin: dayRows.filter((a) => ['izin', 'sakit'].includes(a.status)).length,
    })
  }

  const summary = [
    { icon: <FiUsers className="h-5 w-5" />, label: 'Total Guru Aktif', value: totalGuru, color: 'blue' },
    { icon: <FiCheckCircle className="h-5 w-5" />, label: 'Hadir Hari Ini', value: hadir, color: 'blue' },
    { icon: <FiClock className="h-5 w-5" />, label: 'Terlambat', value: terlambat, color: 'amber' },
    { icon: <FiXCircle className="h-5 w-5" />, label: 'Belum Absen', value: belum, color: 'red' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard TU"
        subtitle={`${formatTanggal(todayISO)} — Selamat datang, ${user.nama}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <Card
        title="Grafik Kehadiran 7 Hari Terakhir"
        action={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Hadir</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" />Terlambat</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />Izin / sakit</span>
          </div>
        }
        noPadding
      >
        <div className="px-3 py-5 sm:px-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-800" />
                <XAxis dataKey="nama" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} stroke="transparent" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: '12px',
                    color: '#1e293b',
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="Hadir" fill="#2563eb" />
                <Bar dataKey="Terlambat" fill="#d97706" />
                <Bar dataKey="Izin" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}
