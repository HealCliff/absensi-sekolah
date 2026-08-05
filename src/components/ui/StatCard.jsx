export default function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    navy: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    gray: 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}
