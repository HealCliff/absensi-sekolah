import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi'
import { useGuruStore } from '../../store/guruStore'
import { useNotificationStore } from '../../store/notificationStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

const KOSONG = {
  nama: '',
  nip_nuptk: '',
  jenis_kelamin: 'L',
  kontak: '',
  jabatan_mapel: '',
  status_aktif: true,
}

export default function DataGuru() {
  const { pageGuruList, guruPagination, fetchGuruPage } = useGuruStore()
  const { addGuru, updateGuru, deleteGuru } = useGuruStore()
  const showNotification = useNotificationStore((state) => state.showNotification)
  const [q, setQ] = useState('')
  const [filterAktif, setFilterAktif] = useState('semua')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = tambah, objek = edit
  const [form, setForm] = useState(KOSONG)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchGuruPage({
      q: q.trim() || undefined,
      status: filterAktif === 'semua' ? undefined : filterAktif,
      page,
      limit: pageSize,
    })
  }, [fetchGuruPage, q, filterAktif, page, pageSize])

  const filtered = useMemo(() => {
    return pageGuruList
  }, [pageGuruList])

  const paginated = useMemo(() => {
    return filtered
  }, [filtered])

  const openTambah = () => {
    setEditing(null)
    setForm(KOSONG)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (guru) => {
    setEditing(guru)
    setForm({ ...guru })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    if (!form.nip_nuptk.trim()) e.nip_nuptk = 'NIP/NUPTK wajib diisi'
    if (!form.kontak.trim()) e.kontak = 'Kontak wajib diisi'
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.kontak.trim())) e.kontak = 'Format kontak tidak valid'
    if (!form.jabatan_mapel.trim()) e.jabatan_mapel = 'Jabatan/Mapel wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      if (editing) {
        await updateGuru(editing.id, form)
        showNotification({ type: 'success', title: 'Data guru diperbarui', message: `Perubahan data ${form.nama} berhasil disimpan.` })
      } else {
        await addGuru(form)
        showNotification({ type: 'success', title: 'Guru berhasil ditambahkan', message: `${form.nama} telah ditambahkan ke daftar guru.` })
      }
      await fetchGuruPage({ q: q.trim() || undefined, status: filterAktif === 'semua' ? undefined : filterAktif, page, limit: pageSize })
      setModalOpen(false)
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal menyimpan', message: err.message })
    }
  }

  const handleDelete = async () => {
    const nama = confirmDelete.nama
    try {
      await deleteGuru(confirmDelete.id)
      await fetchGuruPage({ q: q.trim() || undefined, status: filterAktif === 'semua' ? undefined : filterAktif, page, limit: pageSize })
      setConfirmDelete(null)
      showNotification({ type: 'success', title: 'Data guru dihapus', message: `${nama} telah dihapus dari daftar guru.` })
    } catch (err) {
      setConfirmDelete(null)
      showNotification({ type: 'error', title: 'Gagal menghapus', message: err.message })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Guru"
        subtitle={`Kelola data guru — ${guruPagination.total} guru`}
        action={
          <Button onClick={openTambah}>
            <FiPlus className="h-4 w-4" />
            Tambah Guru
          </Button>
        }
      />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <SearchInput
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Cari nama / NIP / mapel..."
            className="md:w-72"
          />
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="w-32">
              <Select
                value={filterAktif}
                onChange={(e) => { setFilterAktif(e.target.value); setPage(1) }}
                aria-label="Filter status guru"
                options={[
                  { value: 'semua', label: 'Semua Status' },
                  { value: 'aktif', label: 'Aktif' },
                  { value: 'nonaktif', label: 'Non-aktif' },
                ]}
                className="py-2 text-xs"
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{guruPagination.total} entri</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-225 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-semibold dark:bg-slate-950">Nama</th>
                <th className="px-4 py-3 font-semibold">NIP/NUPTK</th>
                <th className="px-4 py-3 font-semibold">Mapel</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((g) => (
                <tr key={g.id} className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {g.nama
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{g.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{g.nip_nuptk}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{g.jabatan_mapel}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{g.kontak}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                        g.status_aktif
                          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {g.status_aktif ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(g)}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        aria-label={`Edit ${g.nama}`}
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(g)}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        aria-label={`Hapus ${g.nama}`}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState icon={FiUsers} title="Tidak ada guru ditemukan" description="Ubah kata kunci pencarian atau filter." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={guruPagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        />
      </Card>

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit Guru' : 'Tambah Guru'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>{editing ? 'Simpan Perubahan' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nama Lengkap *"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="cth: Ahmad Fauzi, S.Pd."
            error={errors.nama}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="NIP/NUPTK *"
              value={form.nip_nuptk}
              onChange={(e) => setForm({ ...form, nip_nuptk: e.target.value })}
              placeholder="cth: 198503152010011001"
              error={errors.nip_nuptk}
            />
            <Select
              label="Jenis Kelamin *"
              value={form.jenis_kelamin}
              onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
              options={[
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Kontak *"
              value={form.kontak}
              onChange={(e) => setForm({ ...form, kontak: e.target.value })}
              placeholder="cth: 081234567890"
              error={errors.kontak}
            />
            <Input
              label="Jabatan / Mapel *"
              value={form.jabatan_mapel}
              onChange={(e) => setForm({ ...form, jabatan_mapel: e.target.value })}
              placeholder="cth: Matematika"
              error={errors.jabatan_mapel}
            />
          </div>
          <Select
            label="Status"
            value={form.status_aktif ? 'aktif' : 'nonaktif'}
            onChange={(e) => setForm({ ...form, status_aktif: e.target.value === 'aktif' })}
            options={[
              { value: 'aktif', label: 'Aktif' },
              { value: 'nonaktif', label: 'Non-aktif' },
            ]}
          />
        </div>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        open={!!confirmDelete}
        title="Hapus Guru"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Ya, Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Yakin ingin menghapus <span className="font-semibold text-slate-900 dark:text-white">{confirmDelete?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
