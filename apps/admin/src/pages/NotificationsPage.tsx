import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageSquareText, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'
import { notificationsService, type AppNotification } from '../services/notifications.service'

const PAGE_SIZE = 12

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    notificationsService.list(PAGE_SIZE, page * PAGE_SIZE).then(data => {
      if (cancelled) return
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
      setHasMore(data.notifications.length === PAGE_SIZE)
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [page])

  const markRead = (id: string) => {
    notificationsService.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = () => {
    notificationsService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <div className="min-h-screen bg-(--v3-bg)">
      <TopBar />
      <main className="max-w-200 mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal)">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-(--v3-text)">Notifications</h1>
              <p className="text-sm text-(--v3-muted2)">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm text-(--v3-muted2) hover:text-(--v3-teal) transition-colors cursor-pointer"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl overflow-hidden">
          {loaded ? (
            notifications.length === 0 ? (
              <div className="py-16 text-center text-sm text-(--v3-muted2)">No notifications yet</div>
            ) : (
              notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markRead(n.id)
                  if (n.formId) navigate(`/forms/${n.formId}`)
                }}
                className={`flex items-start gap-4 px-6 py-4 cursor-pointer border-b border-(--v3-border)/50 hover:bg-(--v3-bg3) transition-colors ${!n.isRead ? 'bg-(--v3-bg3)/50' : ''}`}
              >
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-(--v3-teal)/10 text-(--v3-teal)' : 'bg-(--v3-bg3) text-(--v3-muted2)'}`}>
                  <MessageSquareText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-(--v3-text)' : 'text-(--v3-muted2)'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-(--v3-teal) shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-sm text-(--v3-muted2) mt-0.5">{n.body}</p>
                  )}
                  <p className="text-xs text-(--v3-muted) mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))
            )
          ) : (
            <div className="py-16 text-center text-sm text-(--v3-muted2)">Loading...</div>
          )}
        </div>

        {/* Pagination */}
        {(page > 0 || hasMore) && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 text-sm font-semibold text-(--v3-muted2) hover:text-(--v3-text) disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-xs text-(--v3-muted)">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="flex items-center gap-1.5 text-sm font-semibold text-(--v3-muted2) hover:text-(--v3-text) disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
