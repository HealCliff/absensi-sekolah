import { useEffect, useState } from 'react'
import { FiClock, FiLogIn, FiLogOut, FiSun } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { isTerlambat } from '../../data/absensiData'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useHariLiburStore } from '../../store/hariLiburStore'
import { usePengaturanAbsensiStore } from '../../store/pengaturanAbsensiStore'
import { useServerClock } from '../../hooks/useServerClock'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'


export default function Absensi() {
  const { user } = useAuthStore()
  const allAbsensi = useAttendanceStore((state) => state.records)
  const recordAttendance = useAttendanceStore((state) => state.recordAttendance)
  const showNotification = useNotificationStore((state) => state.showNotification)
  const getKeterangan = useHariLiburStore((state) => state.getKeterangan)
  const fetchHariLibur = useHariLiburStore((state) => state.fetchHariLibur)
  const jamBatasMasuk = usePengaturanAbsensiStore((state) => state.jamBatasMasuk)
  const jamBatasPulang = usePengaturanAbsensiStore((state) => state.jamBatasPulang)
  const pengaturanLoaded = usePengaturanAbsensiStore((state) => state.loaded)
  const pengaturanLoading = usePengaturanAbsensiStore((state) => state.loading)
  const fetchPengaturan = usePengaturanAbsensiStore((state) => state.fetchPengaturan)
  const now = useServerClock()
  const [confirmation, setConfirmation] = useState(null)
  const [keterangan, setKeterangan] = useState('')
  const [reasonRequiredByServer, setReasonRequiredByServer] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPengaturan().catch((err) => {
      showNotification({ type: 'error', title: 'Pengaturan jam gagal dimuat', message: err.message })
    })
  }, [fetchPengaturan, showNotification])

  useEffect(() => {
    const refresh = () => fetchHariLibur().catch(() => {})
    refresh()
    const interval = setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [fetchHariLibur])

  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const jamNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const dbToday = allAbsensi.find((a) => a.guru_id === user.guru_id && a.tanggal === todayISO)
  const sudahMasuk = !!dbToday?.jam_masuk
  const sudahPulang = !!dbToday?.jam_pulang
  const jamMasuk = dbToday?.jam_masuk || null
  const jamPulang = dbToday?.jam_pulang || null
  const liburKeterangan = getKeterangan(todayISO)

  const requestAttendance = (tipe) => {
    if (!pengaturanLoaded || pengaturanLoading) return
    const jam = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setConfirmation({ tipe, jam, tanggal: todayISO })
    setKeterangan('')
    setReasonRequiredByServer(false)
  }

  const perluKeterangan = confirmation && (reasonRequiredByServer
    || (confirmation.tipe === 'masuk' && isTerlambat(confirmation.jam, jamBatasMasuk))
    || (confirmation.tipe === 'pulang' && confirmation.jam < jamBatasPulang))

  const confirmAttendance = async () => {
    if (!confirmation) return
    if (confirmation.tipe === 'masuk' && sudahMasuk) {
      setConfirmation(null)
      return
    }
    if (confirmation.tipe === 'pulang' && (!sudahMasuk || sudahPulang)) {
      setConfirmation(null)
      return
    }

    const { tipe, jam } = confirmation
    const terlambat = tipe === 'masuk' && isTerlambat(jam, jamBatasMasuk)
    if (perluKeterangan && !keterangan.trim()) {
      showNotification({ type: 'error', title: 'Alasan wajib diisi', message: 'Masukkan alasan sebelum menyimpan absensi.' })
      return
    }
    try {
      setSubmitting(true)
      await recordAttendance({ tipe, keterangan: perluKeterangan ? keterangan.trim() : null })
      setConfirmation(null)
      showNotification({
        type: terlambat ? 'warning' : 'success',
        title: `Absen ${tipe === 'masuk' ? 'masuk' : 'pulang'} berhasil`,
        message: terlambat
           ? `Tercatat pukul ${jam} WIB dan melewati batas waktu masuk ${jamBatasMasuk}.`
          : `Waktu absensi tercatat pada pukul ${jam} WIB.`,
      })
    } catch (err) {
      if (err.reasonRequired) {
        setReasonRequiredByServer(true)
      } else {
        setConfirmation(null)
      }
      showNotification({ type: 'error', title: 'Gagal absen', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Absensi" subtitle="Catat waktu masuk dan pulang Anda hari ini" />

      {liburKeterangan && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <FiSun className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Hari ini libur: {liburKeterangan}. Tombol absensi dinonaktifkan.</p>
        </div>
      )}

      <Card>
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"><FiClock className="h-5 w-5" /></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-gray-400">Waktu Sekarang</p>
          <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-5xl">{jamNow}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">{now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </Card>

      <Card title="Status Absensi Hari Ini">
        <div className="grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-gray-800">
          <div className="flex items-center gap-4 py-2 sm:pr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"><FiLogIn className="h-5 w-5" /></div>
            <div><p className="text-sm text-slate-500 dark:text-gray-400">Jam Masuk</p><p className="mt-1 font-mono text-xl font-semibold text-slate-800 dark:text-white">{jamMasuk || '--:--'}</p>{jamMasuk && <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{isTerlambat(jamMasuk, jamBatasMasuk) ? 'Terlambat' : 'Tepat waktu'}</p>}</div>
          </div>
          <div className="flex items-center gap-4 py-2 pt-5 sm:pl-6 sm:pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"><FiLogOut className="h-5 w-5" /></div>
            <div><p className="text-sm text-slate-500 dark:text-gray-400">Jam Pulang</p><p className="mt-1 font-mono text-xl font-semibold text-slate-800 dark:text-white">{jamPulang || '--:--'}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
         <button onClick={() => requestAttendance('masuk')} disabled={!pengaturanLoaded || pengaturanLoading || sudahMasuk || !!liburKeterangan} title={liburKeterangan ? 'Hari ini libur' : undefined} className="flex items-center gap-4 rounded-lg border border-blue-700 bg-blue-700 p-5 text-left text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-400 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500">
          <FiLogIn className="h-7 w-7 shrink-0" /><span><span className="block font-semibold">{sudahMasuk ? `Sudah Absen Masuk (${jamMasuk})` : 'Absen Masuk'}</span><span className="mt-1 block text-xs opacity-80">{liburKeterangan ? 'Hari ini libur' : sudahMasuk ? 'Absensi masuk telah tercatat' : 'Klik untuk mencatat waktu kedatangan'}</span></span>
        </button>
         <button onClick={() => requestAttendance('pulang')} disabled={!pengaturanLoaded || pengaturanLoading || !sudahMasuk || sudahPulang || !!liburKeterangan} title={liburKeterangan ? 'Hari ini libur' : undefined} className="flex items-center gap-4 rounded-lg border border-indigo-700 bg-indigo-700 p-5 text-left text-white shadow-sm transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-400 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500">
          <FiLogOut className="h-7 w-7 shrink-0" /><span><span className="block font-semibold">{sudahPulang ? `Sudah Absen Pulang (${jamPulang})` : 'Absen Pulang'}</span><span className="mt-1 block text-xs opacity-80">{liburKeterangan ? 'Hari ini libur' : !sudahMasuk ? 'Lakukan absen masuk terlebih dahulu' : sudahPulang ? 'Absensi pulang telah tercatat' : 'Klik untuk mencatat waktu kepulangan'}</span></span>
        </button>
      </div>



      <Modal
        open={!!confirmation}
        title={`Konfirmasi Absen ${confirmation?.tipe === 'masuk' ? 'Masuk' : 'Pulang'}`}
        onClose={() => setConfirmation(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmation(null)}>Batal</Button>
            <Button onClick={confirmAttendance} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Ya, Catat Absensi'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            {confirmation?.tipe === 'masuk' ? <FiLogIn className="mt-0.5 h-5 w-5 shrink-0" /> : <FiLogOut className="mt-0.5 h-5 w-5 shrink-0" />}
            <p className="text-sm leading-6">Pastikan jenis dan waktu absensi berikut sudah benar sebelum disimpan.</p>
          </div>
          <dl className="divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-gray-700 dark:border-gray-700">
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-sm text-slate-500 dark:text-gray-400">Nama Guru</dt><dd className="text-right text-sm font-medium text-slate-800 dark:text-white">{user.nama}</dd></div>
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-sm text-slate-500 dark:text-gray-400">Jenis Absensi</dt><dd className="text-sm font-medium text-slate-800 dark:text-white">Absen {confirmation?.tipe === 'masuk' ? 'Masuk' : 'Pulang'}</dd></div>
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-sm text-slate-500 dark:text-gray-400">Tanggal</dt><dd className="text-sm font-medium text-slate-800 dark:text-white">{confirmation?.tanggal}</dd></div>
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-sm text-slate-500 dark:text-gray-400">Waktu</dt><dd className="font-mono text-sm font-semibold text-slate-800 dark:text-white">{confirmation?.jam} WIB</dd></div>
                     </dl>
                     {confirmation?.tipe === 'masuk' && isTerlambat(confirmation.jam, jamBatasMasuk) && <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">Waktu masuk melewati batas pukul {jamBatasMasuk} dan akan tercatat sebagai terlambat.</p>}
                     {confirmation?.tipe === 'pulang' && confirmation.jam < jamBatasPulang && <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">Anda melakukan absen pulang sebelum batas pukul {jamBatasPulang}. Alasan wajib diisi.</p>}
                     {perluKeterangan && (
                       <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                         Alasan
                         <textarea
                           value={keterangan}
                           onChange={(e) => setKeterangan(e.target.value)}
                           rows={3}
                           maxLength={255}
                           placeholder="Tuliskan alasan absensi..."
                           className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                         />
                       </label>
                     )}
         </div>
      </Modal>
    </div>
  )
}
