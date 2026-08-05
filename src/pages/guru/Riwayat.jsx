import { useMemo, useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { formatTanggal } from '../../data/absensiData'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useServerClock } from '../../hooks/useServerClock'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'

export default function Riwayat() {
  const { user } = useAuthStore()
  const allAbsensi = useAttendanceStore((state) => state.records)
  const now = useServerClock()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [bulan, setBulan] = useState(currentMonth)
  const [q, setQ] = useState('')
  const monthLabel = new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const rows = useMemo(() => allAbsensi
    .filter((a) => a.guru_id === user.guru_id && a.tanggal.startsWith(bulan))
    .filter((a) => {
      if (!q.trim()) return true
      const k = q.toLowerCase()
      return a.status.toLowerCase().includes(k) || formatTanggal(a.tanggal).toLowerCase().includes(k)
    })
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal)), [allAbsensi, user.guru_id, bulan, q])

  const bulanOptions = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    bulanOptions.push({ value: val, label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Absensi" subtitle="Lihat catatan kehadiran pribadi Anda" />
      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                  <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari status atau tanggal..." className="sm:max-w-sm" />
                  <select value={bulan} onChange={(e) => setBulan(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500">
            {bulanOptions.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="divide-y divide-slate-100 sm:hidden dark:divide-gray-800">
                  {rows.map((a) => (
                    <article key={a.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatTanggal(a.tanggal)}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Catatan kehadiran</p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 dark:bg-gray-800/50">
                        <div><p className="text-xs text-slate-500 dark:text-gray-400">Jam Masuk</p><p className="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{a.jam_masuk || '-'}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-gray-400">Jam Pulang</p><p className="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{a.jam_pulang || '-'}</p></div>
                      </div>
                    </article>
                  ))}
          {rows.length === 0 && <div className="p-4"><EmptyState icon={FiCalendar} title={`Tidak ada data untuk ${monthLabel}`} /></div>}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-gray-800/40"><tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-gray-800 dark:text-slate-400"><th className="px-5 py-3 font-medium">Tanggal</th><th className="px-5 py-3 font-medium">Jam Masuk</th><th className="px-5 py-3 font-medium">Jam Pulang</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
                        <tbody>
                          {rows.map((a) => <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-gray-800 dark:hover:bg-gray-800/50"><td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{formatTanggal(a.tanggal)}</td><td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{a.jam_masuk || '-'}</td><td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{a.jam_pulang || '-'}</td><td className="px-5 py-3"><StatusBadge status={a.status} /></td></tr>)}
              {rows.length === 0 && <tr><td colSpan={4} className="p-4"><EmptyState icon={FiCalendar} title={`Tidak ada data untuk ${monthLabel}`} /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
