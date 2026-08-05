import { useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi'
import { useHariLiburStore } from '../../store/hariLiburStore'
import { useServerClock } from '../../hooks/useServerClock'
import { useNotificationStore } from '../../store/notificationStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

const KOSONG = {
  tipe: 'single',
  tanggal: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  keterangan: '',
}

export default function HariLibur() {
  const { list, addHariLibur, updateHariLibur, deleteHariLibur } = useHariLiburStore()
  const showNotification = useNotificationStore((state) => state.showNotification)

  const now = useServerClock()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [bulan, setBulan] = useState(currentMonth)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(KOSONG)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const bulanOptions = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    bulanOptions.push({ value: val, label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) })
  }

  const filtered = useMemo(() => list.filter((l) => (l.tanggal || l.tanggalMulai)?.startsWith(bulan)), [list, bulan])

  const formatRange = (l) => {
    if (l.tanggal) return l.tanggal
    return `${l.tanggalMulai} — ${l.tanggalSelesai}`
  }

  const openTambah = () => {
    setEditing(null)
    setForm(KOSONG)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (l) => {
    setEditing(l)
    setForm({
      tipe: l.tanggal ? 'single' : 'range',
      tanggal: l.tanggal || '',
      tanggalMulai: l.tanggalMulai || '',
      tanggalSelesai: l.tanggalSelesai || '',
      keterangan: l.keterangan || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (form.tipe === 'single') {
      if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi'
    } else {
      if (!form.tanggalMulai) e.tanggalMulai = 'Tanggal mulai wajib diisi'
      if (!form.tanggalSelesai) e.tanggalSelesai = 'Tanggal selesai wajib diisi'
      else if (form.tanggalMulai && form.tanggalSelesai < form.tanggalMulai) e.tanggalSelesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai'
    }
    if (!form.keterangan.trim()) e.keterangan = 'Keterangan wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const data = form.tipe === 'single'
      ? { tanggal: form.tanggal, tanggalMulai: null, tanggalSelesai: null, keterangan: form.keterangan.trim() }
      : { tanggal: null, tanggalMulai: form.tanggalMulai, tanggalSelesai: form.tanggalSelesai, keterangan: form.keterangan.trim() }

    try {
      if (editing) {
        await updateHariLibur(editing.id, data)
        showNotification({ type: 'success', title: 'Hari libur diperbarui', message: `Perubahan hari libur berhasil disimpan.` })
      } else {
        await addHariLibur(data)
        showNotification({ type: 'success', title: 'Hari libur ditambahkan', message: `${form.keterangan} berhasil ditambahkan.` })
      }
      setModalOpen(false)
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal menyimpan', message: err.message })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteHariLibur(confirmDelete.id)
      setConfirmDelete(null)
      showNotification({ type: 'success', title: 'Hari libur dihapus', message: `Hari libur ${confirmDelete.keterangan} telah dihapus.` })
    } catch (err) {
      setConfirmDelete(null)
      showNotification({ type: 'error', title: 'Gagal menghapus', message: err.message })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender Hari Libur"
        subtitle={`Kelola hari libur — ${filtered.length} libur di bulan ini`}
        action={
          <Button onClick={openTambah}>
            <FiPlus className="h-4 w-4" />
            Tambah Hari Libur
          </Button>
        }
      />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-56">
            <Select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              options={bulanOptions}
              aria-label="Filter bulan"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} catatan libur</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-155 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Tanggal / Range</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{formatRange(l)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{l.keterangan}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(l)}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        aria-label={`Edit ${l.keterangan}`}
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(l)}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        aria-label={`Hapus ${l.keterangan}`}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-0">
                    <EmptyState icon={FiCalendar} title="Tidak ada hari libur" description="Tidak ada hari libur pada bulan ini." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? 'Simpan Perubahan' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-1 dark:border-gray-700">
            {['single', 'range'].map((tipe) => (
              <button
                key={tipe}
                type="button"
                onClick={() => setForm({ ...form, tipe })}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${form.tipe === tipe ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
              >
                {tipe === 'single' ? 'Satu Tanggal' : 'Range Tanggal'}
              </button>
            ))}
          </div>

          {form.tipe === 'single' ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Tanggal *</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white ${errors.tanggal ? 'border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15 dark:border-gray-700'}`}
              />
              {errors.tanggal && <p className="mt-1 text-xs text-red-600">{errors.tanggal}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                  className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white ${errors.tanggalMulai ? 'border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15 dark:border-gray-700'}`}
                />
                {errors.tanggalMulai && <p className="mt-1 text-xs text-red-600">{errors.tanggalMulai}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Tanggal Selesai *</label>
                <input
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                  className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white ${errors.tanggalSelesai ? 'border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15 dark:border-gray-700'}`}
                />
                {errors.tanggalSelesai && <p className="mt-1 text-xs text-red-600">{errors.tanggalSelesai}</p>}
              </div>
            </div>
          )}

          <Input
            label="Keterangan *"
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            placeholder="cth: Libur Idul Fitri, Libur Semester Ganjil..."
            error={errors.keterangan}
          />
        </div>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        open={!!confirmDelete}
        title="Hapus Hari Libur"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Yakin ingin menghapus hari libur <span className="font-semibold text-slate-900 dark:text-white">{confirmDelete?.keterangan}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
