export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="mb-3 h-6 w-6 text-gray-400" />}
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  )
}
