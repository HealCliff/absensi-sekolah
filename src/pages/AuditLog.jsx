import { useEffect, useState } from 'react'
import { FiActivity } from 'react-icons/fi'
import { useAuditLogStore } from '../store/auditLogStore'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'

function formatWaktu(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function AuditLog() {
  const { logs, pagination, loading, fetchLogs } = useAuditLogStore()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs({ page, limit: pageSize, q })
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchLogs, page, pageSize, q])

  const handleSearch = (event) => {
    setQ(event.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" subtitle="Riwayat aktivitas pengguna dan perubahan data sistem" />

      <Card noPadding>
        <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
          <SearchInput value={q} onChange={handleSearch} placeholder="Cari aktivitas..." className="max-w-md" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-180 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatWaktu(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{log.users?.nama || 'Pengguna'}</p>
                    {log.users?.nik && <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{log.users.nik}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.aktivitas}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-0">
                    <EmptyState icon={FiActivity} title={loading ? 'Memuat audit log...' : 'Belum ada aktivitas'} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={pagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Card>
    </div>
  )
}
