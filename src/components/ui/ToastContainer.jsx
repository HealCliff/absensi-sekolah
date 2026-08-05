import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'
import { useNotificationStore } from '../../store/notificationStore'

const styles = {
  success: { icon: FiCheckCircle, iconClass: 'bg-blue-50 text-blue-700' },
  error: { icon: FiAlertCircle, iconClass: 'bg-red-50 text-red-700' },
  warning: { icon: FiAlertTriangle, iconClass: 'bg-amber-50 text-amber-700' },
  info: { icon: FiInfo, iconClass: 'bg-slate-100 text-slate-700' },
}

export default function ToastContainer() {
  const notifications = useNotificationStore((state) => state.notifications)
  const dismissNotification = useNotificationStore((state) => state.dismissNotification)

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:w-full sm:max-w-sm" aria-live="polite" aria-atomic="false">
      {notifications.map((notification) => {
        const meta = styles[notification.type] || styles.info
        const Icon = meta.icon
        return (
          <div
            key={notification.id}
            role={notification.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full animate-fade-in-up items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
              {notification.message && <p className="mt-1 text-sm leading-5 text-slate-500">{notification.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissNotification(notification.id)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup notifikasi"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
