import { useEffect, useState } from 'react'
import { FiClock, FiSave } from 'react-icons/fi'
import { usePengaturanAbsensiStore } from '../../store/pengaturanAbsensiStore'
import { useNotificationStore } from '../../store/notificationStore'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'

export default function PengaturanAbsensi() {
  const fetchPengaturan = usePengaturanAbsensiStore((state) => state.fetchPengaturan)
  const updatePengaturan = usePengaturanAbsensiStore((state) => state.updatePengaturan)
  const saving = usePengaturanAbsensiStore((state) => state.saving)
  const showNotification = useNotificationStore((state) => state.showNotification)
  const [form, setForm] = useState({ jamBatasMasuk: '07:15', jamBatasPulang: '13:00' })

  useEffect(() => {
    fetchPengaturan().then((data) => {
      setForm({ jamBatasMasuk: data.jam_batas_masuk, jamBatasPulang: data.jam_batas_pulang })
    }).catch((err) => {
      showNotification({ type: 'error', title: 'Gagal memuat pengaturan', message: err.message })
    })
  }, [fetchPengaturan, showNotification])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.jamBatasMasuk >= form.jamBatasPulang) {
      showNotification({ type: 'error', title: 'Jam tidak valid', message: 'Jam masuk harus lebih awal dari jam pulang.' })
      return
    }

    try {
      await updatePengaturan(form)
      showNotification({ type: 'success', title: 'Pengaturan disimpan', message: `Jam masuk ${form.jamBatasMasuk}, jam pulang ${form.jamBatasPulang}.` })
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal menyimpan pengaturan', message: err.message })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Jam Absensi" subtitle="Atur batas waktu masuk dan pulang guru" />

      <Card>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <FiClock className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6">Guru yang absen masuk setelah batas waktu akan diminta mengisi alasan. Guru yang absen pulang sebelum batas waktu juga wajib mengisi alasan. Absen pulang setelah batas waktu tidak meminta alasan.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Batas Jam Masuk"
              type="time"
              value={form.jamBatasMasuk}
              onChange={(e) => setForm({ ...form, jamBatasMasuk: e.target.value })}
              required
            />
            <Input
              label="Batas Jam Pulang"
              type="time"
              value={form.jamBatasPulang}
              onChange={(e) => setForm({ ...form, jamBatasPulang: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={saving}>
            <FiSave className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
