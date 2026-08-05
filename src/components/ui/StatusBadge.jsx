export default function StatusBadge({ status }) {
  const meta = {
    hadir: ['Hadir', 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400'],
    terlambat: ['Terlambat', 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400'],
    izin: ['Izin', 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400'],
    sakit: ['Sakit', 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400'],
    dinas: ['Dinas', 'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-400'],
    alpa: ['Alpa', 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400'],
    belum: ['Belum absen', 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-gray-800 dark:text-gray-400'],
    masuk: ['Masuk', 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400'],
    pulang: ['Pulang', 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400'],
  }
  const [label, cls] = meta[status] || meta.belum
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>{label}</span>
}
