import { useEffect, useMemo, useState } from 'react'
import { FiSave, FiEdit3, FiCalendar, FiPlus } from 'react-icons/fi'
import { formatTanggalPendek } from '../../data/absensiData'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useGuruStore } from '../../store/guruStore'
import { useNotificationStore } from '../../store/notificationStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { useServerClock } from '../../hooks/useServerClock'

export default function RekapAbsen() {
  const absensi = useAttendanceStore((state) => state.recapRecords)
  const recapPagination = useAttendanceStore((state) => state.recapPagination)
  const fetchRecapRecords = useAttendanceStore((state) => state.fetchRecapRecords)
  const addManualRecord = useAttendanceStore((state) => state.addManualRecord)
  const updateRecord = useAttendanceStore((state) => state.updateRecord)
  const guruList = useGuruStore((state) => state.guruList)
  const showNotification = useNotificationStore((state) => state.showNotification)
  const now = useServerClock()
  const [tanggal, setTanggal] = useState(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState(null)
  const [koreksi, setKoreksi] = useState({ status: 'izin', keterangan: '' })
  const [manualOpen, setManualOpen] = useState(false)
  const [manualSaving, setManualSaving] = useState(false)
  const [manualForm, setManualForm] = useState({ guru_id: '', tanggal: '', jam_masuk: '', jam_pulang: '', status: 'hadir', keterangan: '' })

  useEffect(() => {
    const params = {
      tanggal,
      page,
      limit: pageSize,
      ...(filterStatus !== 'semua' ? { status: filterStatus } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    }
    const refresh = () => fetchRecapRecords(params)
    refresh()
    const interval = setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [fetchRecapRecords, tanggal, q, filterStatus, page, pageSize])

  const guruMap = useMemo(() => Object.fromEntries(guruList.map((g) => [g.id, g])), [guruList])

  const filtered = useMemo(() => {
    return [...absensi].sort((a, b) => a.guru_id - b.guru_id)
  }, [absensi])

  const paginated = useMemo(() => {
    return filtered
  }, [filtered])

  const openKoreksi = (row) => {
    setEditing(row)
    setKoreksi({ status: row.status === 'belum' ? 'izin' : row.status, keterangan: row.keterangan || '' })
  }

  const saveKoreksi = async () => {
    const tanpaKehadiran = ['izin', 'sakit', 'dinas', 'alpa'].includes(koreksi.status)
    try {
      await updateRecord(editing.id, {
        status: koreksi.status,
        keterangan: koreksi.keterangan || null,
        jam_masuk: tanpaKehadiran ? editing.jam_masuk : editing.jam_masuk || '07:00',
      })
      const namaGuru = guruMap[editing.guru_id]?.nama || 'Guru'
      setEditing(null)
      showNotification({
        type: 'success',
        title: 'Koreksi absensi disimpan',
        message: `Status absensi ${namaGuru} telah diperbarui menjadi ${koreksi.status}.`,
      })
    } catch (err) {
      setEditing(null)
      showNotification({ type: 'error', title: 'Gagal menyimpan', message: err.message })
    }
  }

  const openManual = () => {
    const guruPertama = guruList.find((guru) => guru.status_aktif)
    setManualForm({
      guru_id: guruPertama ? String(guruPertama.id) : '',
      tanggal,
      jam_masuk: '',
      jam_pulang: '',
      status: 'hadir',
      keterangan: '',
    })
    setManualOpen(true)
  }

  const saveManual = async () => {
    if (!manualForm.guru_id || !manualForm.tanggal) {
      showNotification({ type: 'error', title: 'Data belum lengkap', message: 'Guru dan tanggal wajib dipilih.' })
      return
    }

    try {
      setManualSaving(true)
      await addManualRecord({
        guru_id: Number(manualForm.guru_id),
        tanggal: manualForm.tanggal,
        jam_masuk: manualForm.jam_masuk || null,
        jam_pulang: manualForm.jam_pulang || null,
        status: manualForm.status,
        keterangan: manualForm.keterangan.trim() || null,
      })
      await fetchRecapRecords({
        tanggal,
        page,
        limit: pageSize,
        ...(filterStatus !== 'semua' ? { status: filterStatus } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
      })
      setManualOpen(false)
      showNotification({ type: 'success', title: 'Absensi manual tersimpan', message: 'Data absensi berhasil dicatat.' })
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal menyimpan absensi', message: err.message })
    } finally {
      setManualSaving(false)
    }
  }

  const statusOptions = [
    { value: 'hadir', label: 'Hadir' },
    { value: 'terlambat', label: 'Terlambat' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'dinas', label: 'Dinas Luar' },
    { value: 'alpa', label: 'Alpa' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Absen Harian"
        subtitle="Koreksi & kelola absensi guru per hari"
      />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => { setTanggal(e.target.value); setPage(1) }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <SearchInput
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="Cari nama guru..."
              className="sm:w-60"
            />
            <div className="w-full sm:w-36">
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
              <Select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                options={[
                  { value: 'semua', label: 'Semua' },
                  ...statusOptions,
                  { value: 'belum', label: 'Belum Absen' },
                ]}
                className="py-2 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">{recapPagination.total} catatan</p>
            <Button size="sm" onClick={openManual}>
              <FiPlus className="h-3.5 w-3.5" />
              Input Manual
            </Button>
          </div>
        </div>

        {/* Kartu mobile */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {paginated.map((a) => {
            const guru = guruMap[a.guru_id]
            return (
              <article key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{guru?.nama || 'Guru'}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Masuk {a.jam_masuk || '-'} · Pulang {a.jam_pulang || '-'}</p>
                    {a.keterangan && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.keterangan}</p>}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => openKoreksi(a)}>
                  <FiEdit3 className="h-3.5 w-3.5" />
                  Koreksi
                </Button>
              </article>
            )
          })}
          {paginated.length === 0 && (
            <div className="p-4">
              <EmptyState icon={FiCalendar} title={`Tidak ada data absensi untuk ${formatTanggalPendek(tanggal)}`} description="Ubah tanggal atau filter status." />
            </div>
          )}
        </div>

        {/* Tabel desktop */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-230 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 font-semibold dark:bg-slate-950">Guru</th>
                <th className="px-4 py-2.5 font-semibold">Jam Masuk</th>
                <th className="px-4 py-2.5 font-semibold">Jam Pulang</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Keterangan</th>
                <th className="px-4 py-2.5 font-semibold">Dikoreksi</th>
                <th className="px-4 py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => {
                const guru = guruMap[a.guru_id]
                return (
                  <tr key={a.id} className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 dark:bg-slate-900">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{guru?.nama || 'Guru'}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">{a.jam_masuk || '-'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">{a.jam_pulang || '-'}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{a.keterangan || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">{a.dikoreksi_oleh || '-'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openKoreksi(a)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        aria-label={`Koreksi absensi ${guru?.nama || 'guru'}`}
                      >
                        <FiEdit3 className="h-3.5 w-3.5" />
                        Koreksi
                      </button>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState icon={FiCalendar} title={`Tidak ada data absensi untuk ${formatTanggalPendek(tanggal)}`} description="Ubah tanggal atau filter status." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={recapPagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        />
      </Card>

      {/* Modal koreksi */}
      <Modal
        open={!!editing}
        title={`Koreksi Absen — ${guruMap[editing?.guru_id]?.nama || ''}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={saveKoreksi}>
              <FiSave className="h-4 w-4" />
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tanggal: <span className="font-medium text-slate-900 dark:text-white">{formatTanggalPendek(editing?.tanggal)}</span>
          </p>
          <Select
            label="Status"
            value={koreksi.status}
            onChange={(e) => setKoreksi({ ...koreksi, status: e.target.value })}
            options={statusOptions}
          />
          <Input
            label="Keterangan"
            value={koreksi.keterangan}
            onChange={(e) => setKoreksi({ ...koreksi, keterangan: e.target.value })}
            placeholder="cth: Sakit, izin keluarga, dinas luar..."
          />
        </div>
      </Modal>

      <Modal
        open={manualOpen}
        title="Input Absensi Manual"
        onClose={() => setManualOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setManualOpen(false)}>Batal</Button>
            <Button onClick={saveManual} disabled={manualSaving}>
              <FiSave className="h-4 w-4" />
              {manualSaving ? 'Menyimpan...' : 'Simpan Absensi'}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <Select
            label="Guru"
            value={manualForm.guru_id}
            onChange={(e) => setManualForm({ ...manualForm, guru_id: e.target.value })}
            options={guruList.filter((guru) => guru.status_aktif).map((guru) => ({ value: String(guru.id), label: guru.nama }))}
          />
          <Input
            label="Tanggal"
            type="date"
            value={manualForm.tanggal}
            onChange={(e) => setManualForm({ ...manualForm, tanggal: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Jam Masuk"
              type="time"
              value={manualForm.jam_masuk}
              onChange={(e) => setManualForm({ ...manualForm, jam_masuk: e.target.value })}
            />
            <Input
              label="Jam Pulang"
              type="time"
              value={manualForm.jam_pulang}
              onChange={(e) => setManualForm({ ...manualForm, jam_pulang: e.target.value })}
            />
          </div>
          <Select
            label="Status"
            value={manualForm.status}
            onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
            options={statusOptions}
          />
          <Input
            label="Keterangan"
            value={manualForm.keterangan}
            onChange={(e) => setManualForm({ ...manualForm, keterangan: e.target.value })}
            maxLength={255}
            placeholder="Contoh: Lupa absen, dinas luar, atau sakit"
          />
        </div>
      </Modal>
    </div>
  )
}
