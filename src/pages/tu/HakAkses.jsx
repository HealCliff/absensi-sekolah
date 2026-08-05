import { FiShield, FiUser } from 'react-icons/fi'
import { useUsersStore } from '../../store/usersStore'
import { useNotificationStore } from '../../store/notificationStore'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'

const ROLES = [
  { value: 'guru', label: 'Guru' },
  { value: 'tata_usaha', label: 'Tata Usaha' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
]

export default function HakAkses() {
  const { users } = useUsersStore()
  const { changeRole } = useUsersStore()
  const showNotification = useNotificationStore((state) => state.showNotification)

  const handleChangeRole = (id, role) => {
    changeRole(id, role).catch((err) => {
      showNotification({ type: 'error', title: 'Gagal mengubah role', message: err.message })
    })
  }

  const handleSave = () => {
    showNotification({
      type: 'success',
      title: 'Hak akses disimpan',
      message: 'Perubahan peran pengguna berhasil disimpan.',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Hak Akses" subtitle="Kelola peran pengguna sistem" />

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} pengguna</p>
          <Button className="w-full sm:w-auto" onClick={handleSave}>
            <FiShield className="h-4 w-4" />
            Simpan Perubahan
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-150 w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-semibold dark:bg-slate-950">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-200 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        <FiUser className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{u.nik}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-50">
                      <Select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        options={ROLES}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </Card>
    </div>
  )
}