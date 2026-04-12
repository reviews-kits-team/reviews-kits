import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { ProfileMenu } from './profile-menu'
import { NotificationPanel } from './notification-panel'
import { authClient } from '../../lib/auth-client'
import { notificationsService, type AppNotification } from '../../services/notifications.service'
import logo from '../../assets/logo.svg'

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const fetchNotifications = useCallback(() => {
    notificationsService.list().then(data => {
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    })
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    if (!isMenuOpen && !isNotifOpen) return
    const close = () => { setIsMenuOpen(false); setIsNotifOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [isMenuOpen, isNotifOpen])

  return (
    <header className="sticky top-0 z-200 h-16 flex items-center border-b border-(--v3-border) bg-(--v3-bg)/90 backdrop-blur-xl">
      <div className="flex items-center justify-between w-full max-w-285 mx-auto px-6">
        <a href="/" className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
          
          <div className="w-7 h-7 rounded-lg bg-[--v3-teal] flex items-center justify-center text-sm shadow-[0_0_16px_var(--v3-teal-glow)] text-white">
            <img src={logo} alt="reviewkits logo" />
          </div>
        </a>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsNotifOpen(prev => !prev); setIsMenuOpen(false) }}
              className="relative flex items-center justify-center p-2 rounded-lg bg-(--v3-bg2) border border-(--v3-border) text-(--v3-muted2) hover:text-(--v3-text) hover:border-(--v3-border2) transition-all"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-(--v3-red) rounded-full border-2 border-(--v3-bg)">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={isNotifOpen}
              notifications={notifications}
              onMarkRead={(id) => {
                notificationsService.markRead(id)
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
                setUnreadCount(prev => Math.max(0, prev - 1))
              }}
              onMarkAllRead={() => {
                notificationsService.markAllRead()
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                setUnreadCount(0)
              }}
              onNavigate={(formId) => {
                setIsNotifOpen(false)
                navigate(`/forms/${formId}`)
              }}
            />
          </div>
          
          <div className="relative">
            <div
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev) }}
              className="flex items-center gap-2.5 bg-(--v3-bg2) border border-(--v3-border) rounded-full py-1.5 pl-1.5 pr-3.5 cursor-pointer hover:border-(--v3-border2) transition-all group"
            >
              <div className="w-7.5 h-7.5 rounded-full bg-linear-to-br from-(--v3-teal) to-[#0a6e52] flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                {session?.user?.name?.[0] || 'RK'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-(--v3-text)">{session?.user?.name || 'User'}</span>
                <ChevronDown size={14} className={`text-(--v3-muted2) transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <ProfileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  )
}
