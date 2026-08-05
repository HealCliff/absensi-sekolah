import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Select from './Select'

function pageRange(totalPages, current) {
  const pages = []
  const start = Math.max(1, current - 1)
  const end = Math.min(totalPages, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (start > 2) pages.unshift('…')
  if (start > 1) pages.unshift(1)
  if (end < totalPages - 1) pages.push('…')
  if (end < totalPages) pages.push(totalPages)
  return pages
}

export default function Pagination({ page, total, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = [10, 25, 50] }) {
  if (total === 0) return null
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
        <span>Menampilkan</span>
        <span className="font-semibold text-slate-700 dark:text-gray-200">{from}–{to}</span>
        <span>dari {total} data</span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="w-24">
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Jumlah data per halaman"
            options={pageSizeOptions.map((n) => ({ value: n, label: `${n} / hal` }))}
            className="py-1.5 text-xs"
          />
        </div>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Halaman sebelumnya"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          {pageRange(totalPages, page).map((p, i) =>
            p === '…' ? (
              <span key={`dots-${i}`} className="px-1 text-xs text-slate-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-8 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                  p === page
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Halaman selanjutnya"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
