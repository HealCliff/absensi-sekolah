import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiPrinter, FiFileText } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { bulanRange, formatBulan, useLaporanStore } from '../store/laporanStore'
import { useNotificationStore } from '../store/notificationStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import { createXlsx } from '../utils/exportXlsx'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { useServerClock } from '../hooks/useServerClock'

export default function Laporan() {
  const { user } = useAuthStore()
  const { tahunAjaran, periodeLabel, laporanData, tahunAjaranOptions, loading, setTahunAjaran, fetchLaporan, fetchLaporanRange } = useLaporanStore()
  const { showNotification } = useNotificationStore()
  const now = useServerClock()
  const isReadOnly = user.role === 'kepala_sekolah'
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [jenisPeriode, setJenisPeriode] = useState('tahun_ajaran')
  const [bulan, setBulan] = useState(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    if (jenisPeriode === 'tahun_ajaran') {
      fetchLaporan().catch((err) => showNotification({ type: 'error', title: 'Gagal memuat laporan', message: err.message }))
      return
    }
    if (!bulan) return

    const { mulai, sampai } = bulanRange(bulan)
    fetchLaporanRange(mulai, sampai, `Bulan ${formatBulan(bulan)}`).catch((err) => {
      showNotification({ type: 'error', title: 'Gagal memuat laporan', message: err.message })
    })
  }, [jenisPeriode, bulan, fetchLaporan, fetchLaporanRange, showNotification])

  const filtered = useMemo(() => {
    const k = q.toLowerCase()
    return laporanData.filter((l) => l.nama.toLowerCase().includes(k) || l.nip_nuptk.includes(k))
  }, [laporanData, q])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const handleExportExcel = async () => {
    try {
      const periodeFile = jenisPeriode === 'tahun_ajaran' ? tahunAjaran.replace('/', '-') : bulan
      const fileName = `Laporan_Absensi_${periodeFile}.xlsx`
      const buffer = createXlsx(
        ['Nama Guru', 'NIP/NUPTK', 'Jabatan/Mapel', 'Total Hari Kerja', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa', 'Kehadiran'],
        laporanData.map((l) => [
          l.nama,
          l.nip_nuptk,
          l.jabatan_mapel || '-',
          l.totalHariKerja,
          l.hadir,
          l.terlambat,
          l.izin,
          l.sakit,
          l.alpa,
          `${l.persentaseKehadiran}%`,
        ])
      )
      const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
      showNotification({ type: 'success', title: 'File berhasil diunduh', message: fileName })
    } catch (err) {
      showNotification({ type: 'error', title: 'Error', message: err.message })
    }
  }

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const periodeFile = jenisPeriode === 'tahun_ajaran' ? tahunAjaran.replace('/', '-') : bulan
      const fileName = `Laporan_Absensi_${periodeFile}.pdf`

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Laporan Absensi Guru', 14, 15)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('MTs SA Al-Barokah Ciambar', 14, 22)
      doc.text(periodeLabel, 14, 28)

      autoTable(doc, {
        startY: 34,
        head: [['Nama Guru', 'NIP/NUPTK', 'Jabatan/Mapel', 'Hari Kerja', 'Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa', 'Kehadiran']],
        body: laporanData.map((l) => [
          l.nama,
          l.nip_nuptk,
          l.jabatan_mapel || '-',
          l.totalHariKerja,
          l.hadir,
          l.terlambat,
          l.izin,
          l.sakit,
          l.alpa,
          `${l.persentaseKehadiran}%`,
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [29, 78, 216], textColor: 255 },
      })

      doc.save(fileName)
      showNotification({ type: 'success', title: 'PDF berhasil diunduh', message: fileName })
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal membuat PDF', message: err.message })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Absensi"
        subtitle={`${periodeLabel} — ${filtered.length} guru`}
        action={
          !isReadOnly && (
            <div className="flex gap-2">
              <Button onClick={handleExportExcel} variant="secondary" disabled={loading}><FiDownload className="h-4 w-4" /> Export Excel</Button>
              <Button onClick={handleExportPdf} variant="secondary" disabled={loading}><FiFileText className="h-4 w-4" /> Export PDF</Button>
              <Button onClick={handlePrint} variant="secondary"><FiPrinter className="h-4 w-4" /> Cetak</Button>
            </div>
          )
        }
      />

      <Card>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="w-full sm:w-48">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Periode</label>
                <Select
                  value={jenisPeriode}
                  onChange={(e) => { setJenisPeriode(e.target.value); setPage(1) }}
                  options={[{ value: 'tahun_ajaran', label: 'Tahun Ajaran' }, { value: 'bulanan', label: 'Bulanan' }]}
                />
              </div>
              <div className="w-full sm:w-48">
                {jenisPeriode === 'tahun_ajaran' ? (
                  <>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tahun Ajaran</label>
                    <Select
                      value={tahunAjaran}
                      onChange={(e) => { setTahunAjaran(e.target.value); setPage(1) }}
                      options={tahunAjaranOptions.map((o) => ({ value: o.value, label: o.label }))}
                    />
                  </>
                ) : (
                  <>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Bulan</label>
                    <input
                      type="month"
                      value={bulan}
                      onChange={(e) => { setBulan(e.target.value); setPage(1) }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </>
                )}
              </div>
            </div>
          <div className="flex-1">
            <SearchInput value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Cari nama / NIP..." />
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Nama Guru</th>
                <th className="px-4 py-3 font-semibold">NIP/NUPTK</th>
                <th className="px-4 py-3 text-center font-semibold">Total Hari Kerja</th>
                <th className="px-4 py-3 text-center font-semibold">Hadir</th>
                <th className="px-4 py-3 text-center font-semibold">Terlambat</th>
                <th className="px-4 py-3 text-center font-semibold">Izin</th>
                <th className="px-4 py-3 text-center font-semibold">Sakit</th>
                <th className="px-4 py-3 text-center font-semibold">Alpa</th>
                <th className="px-4 py-3 text-right font-semibold">Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l) => (
                <tr key={l.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{l.nama}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{l.nip_nuptk}</td>
                  <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{l.totalHariKerja}</td>
                  <td className="px-4 py-3 text-center text-green-700 dark:text-green-400">{l.hadir}</td>
                  <td className="px-4 py-3 text-center text-amber-700 dark:text-amber-400">{l.terlambat}</td>
                  <td className="px-4 py-3 text-center text-blue-700 dark:text-blue-400">{l.izin}</td>
                  <td className="px-4 py-3 text-center text-purple-700 dark:text-purple-400">{l.sakit}</td>
                  <td className="px-4 py-3 text-center text-red-700 dark:text-red-400">{l.alpa}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">{l.persentaseKehadiran}%</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState icon={FiFileText} title={loading ? 'Memuat laporan...' : 'Belum ada data laporan'} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > pageSize && <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1) }} />}
      </Card>
    </div>
  )
}
