import { useMemo } from 'react'
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
import StatusBadge from '../../components/ui/StatusBadge'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function KepsekDashboard() {
  const { user } = useAuthStore()
  const allAbsensi = useAttendanceStore((state) => state.records)
  const guruList = useGuruStore((state) => state.guruList)

  const now = useServerClock()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const activeGuru = guruList.filter((g) => g.status_aktif)
  const todayRows = allAbsensi.filter((a) => a.tanggal === todayISO)
  const guruMap = useMemo(() => Object.fromEntries(guruList.map((g) => [g.id, g])), [guruList])

  const totalGuru = activeGuru.length
  const hadir = todayRows.filter((a) => ['hadir', 'terlambat', 'masuk', 'pulang'].includes(a.status)).length
  const terlambat = todayRows.filter((a) => a.status === 'terlambat').length
  const belum = totalGuru - todayRows.filter((a) => a.status !== 'belum').length

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
    })
  }

  const summary = [
    { icon: <FiUsers className="h-5 w-5" />, label: 'Total Guru Aktif', value: totalGuru, color: 'blue' },
    { icon: <FiCheckCircle className="h-5 w-5" />, label: 'Hadir Hari Ini', value: hadir, color: 'blue' },
    { icon: <FiClock className="h-5 w-5" />, label: 'Terlambat', value: terlambat, color: 'amber' },
    { icon: <FiXCircle className="h-5 w-5" />, label: 'Belum Absen', value: belum, color: 'red' },
  ]

  const todayTable = todayRows
    .map((a) => ({ ...a, guru: guruMap[a.guru_id] }))
    .filter((a) => a.guru)
    .sort((a, b) => a.guru_id - b.guru_id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Kepala Sekolah"
        subtitle={`${formatTanggal(todayISO)} — Selamat datang, ${user.nama}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card
          title="Grafik Kehadiran 7 Hari Terakhir"
          action={
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Hadir</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" />Terlambat</span>
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card title="Absensi Hari Ini" subtitle={`${todayTable.length} guru`} noPadding>
          <div className="overflow-x-auto">
            <table className="min-w-155 w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 font-semibold dark:bg-slate-950">Nama Guru</th>
                  <th className="px-4 py-2.5 font-semibold">Masuk</th>
                  <th className="px-4 py-2.5 font-semibold">Pulang</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayTable.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-200">{a.guru.nama}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">{a.jam_masuk || '-'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">{a.jam_pulang || '-'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
                {todayTable.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <EmptyState icon={FiUsers} title="Belum ada data absensi hari ini" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
