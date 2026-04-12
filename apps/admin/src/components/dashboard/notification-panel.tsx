import { MessageSquareText, CheckCheck } from 'lucide-react'
import type { AppNotification } from '../../services/notifications.service'

interface NotificationPanelProps {
  isOpen: boolean
  notifications: AppNotification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onNavigate: (formId: string) => void
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationPanel({ isOpen, notifications, onMarkRead, onMarkAllRead, onNavigate }: NotificationPanelProps) {
  if (!isOpen) return null

  const hasUnread = notifications.some(n => !n.isRead)

  return (
    <div
      className="absolute top-full right-0 mt-2 w-96 bg-(--v3-bg2) border border-(--v3-border) rounded-2xl shadow-2xl z-[300] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--v3-border)">
        <h3 className="text-sm font-bold text-(--v3-text)">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-(--v3-muted2) hover:text-(--v3-teal) transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-(--v3-muted2)">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) onMarkRead(n.id)
                if (n.formId) onNavigate(n.formId)
              }}
              className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer border-b border-(--v3-border)/50 hover:bg-(--v3-bg3) transition-colors ${!n.isRead ? 'bg-(--v3-bg3)/50' : ''}`}
            >
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-(--v3-teal)/10 text-(--v3-teal)' : 'bg-(--v3-bg3) text-(--v3-muted2)'}`}>
                <MessageSquareText size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${!n.isRead ? 'font-semibold text-(--v3-text)' : 'text-(--v3-muted2)'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-(--v3-teal) shrink-0" />
                  )}
                </div>
                {n.body && (
                  <p className="text-xs text-(--v3-muted2) truncate mt-0.5">{n.body}</p>
                )}
                <p className="text-[11px] text-(--v3-muted) mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
