import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiUsers, FiKey, FiPower, FiCopy, FiTrash2 } from 'react-icons/fi'
import { useUsersStore } from '../../store/usersStore'
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

const ROLES = [
  { value: 'guru', label: 'Guru' },
  { value: 'tata_usaha', label: 'Tata Usaha' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
]

const KOSONG = { nama: '', nik: '', role: 'guru' }

export default function ManajemenAkun() {
  const { users, pageUsers, usersPagination, fetchUsersPage, addUser, toggleStatus, resetPassword, deleteUser } = useUsersStore()
  const showNotification = useNotificationStore((state) => state.showNotification)

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(KOSONG)
  const [errors, setErrors] = useState({})
  const [resultPassword, setResultPassword] = useState(null) // { nama, password }
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmReset, setConfirmReset] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchUsersPage({ q: q.trim() || undefined, page, limit: pageSize })
  }, [fetchUsersPage, q, page, pageSize])

  const filtered = useMemo(() => {
    return pageUsers
  }, [pageUsers])

  const paginated = useMemo(() => {
    return filtered
  }, [filtered])

  const roleLabel = { guru: 'Guru', tata_usaha: 'Tata Usaha', kepala_sekolah: 'Kepala Sekolah' }

  const handleSave = async () => {
    const nextErrors = {}
    if (!form.nama.trim()) nextErrors.nama = 'Nama wajib diisi'
    if (!form.nik.trim()) nextErrors.nik = 'NIK wajib diisi'
    else if (!/^\d{16}$/.test(form.nik.trim())) nextErrors.nik = 'NIK harus 16 digit angka'
    else if (users.some((u) => u.nik === form.nik.trim())) nextErrors.nik = 'NIK sudah terdaftar'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const { password } = await addUser({ nama: form.nama.trim(), nik: form.nik.trim(), role: form.role })
      await fetchUsersPage({ q: q.trim() || undefined, page, limit: pageSize })
      setModalOpen(false)
      setForm(KOSONG)
      showNotification({ type: 'success', title: 'Akun berhasil dibuat', message: `${form.nama} wajib mengganti password saat login pertama.` })
      setResultPassword({ nama: form.nama.trim(), password })
    } catch (err) {
      setErrors({ form: err.message })
    }
  }

  const handleToggleStatus = async () => {
    const user = users.find((u) => u.id === confirmToggle.id)
    try {
      await toggleStatus(confirmToggle.id)
      await fetchUsersPage({ q: q.trim() || undefined, page, limit: pageSize })
      setConfirmToggle(null)
      showNotification({
        type: 'success',
        title: user.status_aktif ? 'Akun dinonaktifkan' : 'Akun diaktifkan',
        message: `${user.nama} kini ${user.status_aktif ? 'tidak dapat' : 'dapat'} masuk ke sistem.`,
      })
    } catch (err) {
      setConfirmToggle(null)
      showNotification({ type: 'error', title: 'Gagal', message: err.message })
    }
  }

  const handleReset = async () => {
    try {
      const { password } = await resetPassword(confirmReset.id)
      await fetchUsersPage({ q: q.trim() || undefined, page, limit: pageSize })
      setConfirmReset(null)
      setResultPassword({ nama: confirmReset.nama, password })
    } catch (err) {
      setConfirmReset(null)
      showNotification({ type: 'error', title: 'Gagal reset', message: err.message })
    }
  }

  const handleDelete = async () => {
    const user = users.find((u) => u.id === confirmDelete.id)
    try {
      await deleteUser(confirmDelete.id)
      await fetchUsersPage({ q: q.trim() || undefined, page, limit: pageSize })
      setConfirmDelete(null)
      showNotification({
        type: 'success',
        title: 'Akun dihapus',
        message: `Akun ${user.nama} telah dihapus dari sistem.`,
      })
    } catch (err) {
      setConfirmDelete(null)
      showNotification({ type: 'error', title: 'Gagal menghapus', message: err.message })
    }
  }

  const copyPassword = (password) => {
    navigator.clipboard?.writeText(password)
    showNotification({ type: 'success', title: 'Disalin', message: 'Password sementara disalin ke clipboard.' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Akun"
        subtitle={`Kelola akun pengguna — ${usersPagination.total} akun`}
        action={
          <Button onClick={() => { setForm(KOSONG); setErrors({}); setModalOpen(true) }}>
            <FiPlus className="h-4 w-4" />
            Tambah Akun Guru
          </Button>
        }
      />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <SearchInput
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Cari nama / NIK..."
            className="md:w-72"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">{usersPagination.total} akun</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-225 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-semibold dark:bg-slate-950">Nama</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status Akun</th>
                <th className="px-4 py-3 font-semibold">Password</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u.id} className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {u.nama.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{u.nik}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{roleLabel[u.role] || u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${u.status_aktif ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {u.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">••••••••••</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setConfirmReset({ id: u.id, nama: u.nama })}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-500 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"
                      >
                        <FiKey className="h-3.5 w-3.5" />
                        Reset Password
                      </button>
                      <button
                        onClick={() => setConfirmToggle({ id: u.id, nama: u.nama, status_aktif: u.status_aktif })}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        aria-label={u.status_aktif ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                      >
                        <FiPower className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: u.id, nama: u.nama })}
                        className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-600 dark:hover:bg-red-600 dark:hover:text-white"
                        aria-label="Hapus akun"
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
                    <EmptyState icon={FiUsers} title="Tidak ada akun ditemukan" description="Ubah kata kunci pencarian." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={usersPagination.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
        />
      </Card>

      {/* Modal tambah akun */}
      <Modal
        open={modalOpen}
        title="Tambah Akun Guru"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Buat Akun</Button>
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
          <Input
            label="NIK (16 digit) *"
            value={form.nik}
            onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '') })}
            placeholder="cth: 1234567890123456"
            maxLength="16"
            error={errors.nik}
          />
          <Select
            label="Role *"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={ROLES}
          />
          <p className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            Password sementara dibuat otomatis oleh sistem. Guru wajib mengganti password saat login pertama.
          </p>
        </div>
      </Modal>

      {/* Modal hasil password (tambah / reset) */}
      <Modal
        open={!!resultPassword}
        title="Password Sementara"
        onClose={() => setResultPassword(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResultPassword(null)}>Tutup</Button>
            <Button onClick={() => copyPassword(resultPassword.password)}><FiCopy className="h-4 w-4" /> Salin</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sampaikan password sementara ini kepada <span className="font-semibold text-slate-900 dark:text-white">{resultPassword?.nama}</span>. Guru wajib mengganti password saat login pertama.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <code className="font-mono text-lg font-semibold tracking-wide text-slate-800 dark:text-white">{resultPassword?.password}</code>
            <button onClick={() => copyPassword(resultPassword.password)} className="rounded-md border border-slate-300 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700" aria-label="Salin password">
              <FiCopy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi aktif/nonaktif */}
      <Modal
        open={!!confirmToggle}
        title={confirmToggle?.status_aktif ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        onClose={() => setConfirmToggle(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmToggle(null)}>Batal</Button>
            <Button variant={confirmToggle?.status_aktif ? 'danger' : 'primary'} onClick={handleToggleStatus}>
              Ya, {confirmToggle?.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Yakin ingin {confirmToggle?.status_aktif ? 'menonaktifkan' : 'mengaktifkan'} akun <span className="font-semibold text-slate-900 dark:text-white">{confirmToggle?.nama}</span>?
          {confirmToggle?.status_aktif && ' Pengguna tidak dapat masuk ke sistem selama akun nonaktif.'}
        </p>
      </Modal>

      {/* Modal konfirmasi reset */}
      <Modal
        open={!!confirmReset}
        title="Reset Password"
        onClose={() => setConfirmReset(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(null)}>Batal</Button>
            <Button onClick={handleReset}>Ya, Reset</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Reset password untuk <span className="font-semibold text-slate-900 dark:text-white">{confirmReset?.nama}</span>? Password lama tidak akan berfungsi lagi dan akan dibuat password sementara baru.
        </p>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        open={!!confirmDelete}
        title="Hapus Akun"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Yakin ingin menghapus akun <span className="font-semibold text-slate-900 dark:text-white">{confirmDelete?.nama}</span>? Tindakan ini tidak dapat dibatalkan dan akun tidak dapat digunakan lagi.
        </p>
      </Modal>
    </div>
  )
}
