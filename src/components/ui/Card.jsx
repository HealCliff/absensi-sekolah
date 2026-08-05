export default function Card({ title, subtitle, action, children, className = '', hoverable = false, noPadding = false }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${hoverable ? 'transition-shadow hover:shadow-md' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
            {subtitle && <p className="mt-1 truncate text-xs text-slate-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  )
}
