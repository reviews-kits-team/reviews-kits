import { useState, useEffect } from 'react'
import { SettingsLayout } from '../components/dashboard/settings-layout'
import { Globe, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { meService, type NotificationPrefs } from '../services/me.service'

const defaultPrefs: NotificationPrefs = { newReview: true, weeklyReport: true }

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(defaultPrefs)
  useEffect(() => {
    meService.getMe().then(data => {
      if (data.user.notificationPrefs) setNotifPrefs(data.user.notificationPrefs)
    })
  }, [])

  const togglePref = (key: keyof NotificationPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    meService.updateNotificationPrefs({ [key]: updated[key] })
  }

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Configure general options for your account and interface."
    >
      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2)">
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
               </div>
               <div>
                  <h3 className="font-bold text-(--v3-text)">{isDark ? 'Dark Mode' : 'Light Mode'}</h3>
                  <p className="text-xs text-(--v3-muted2)">Switch between dark and light theme.</p>
               </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative cursor-pointer p-1 transition-colors duration-300 ${isDark ? 'bg-(--v3-teal)' : 'bg-(--v3-border2)'}`}
              aria-label="Toggle theme"
            >
               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2)">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-bold text-(--v3-text)">Language & Region</h3>
                <p className="text-xs text-(--v3-muted2)">Default interface language.</p>
              </div>
           </div>

           <select className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl py-3 px-4 text-sm text-(--v3-text) outline-none appearance-none">
              <option value="fr">Français (France)</option>
              <option value="en">English (US)</option>
           </select>
        </div>

        {/* Notifications */}
        <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2)">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-(--v3-text)">Notifications Email</h3>
                <p className="text-xs text-(--v3-muted2)">Manage your notification preferences.</p>
              </div>
           </div>
           <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={notifPrefs.newReview} onChange={() => togglePref('newReview')} className="w-4 h-4 rounded border-(--v3-border) bg-(--v3-bg) text-(--v3-teal)" />
                 <span className="text-sm text-(--v3-text) group-hover:text-(--v3-teal) transition-colors">New reviews received</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={notifPrefs.weeklyReport} onChange={() => togglePref('weeklyReport')} className="w-4 h-4 rounded border-(--v3-border) bg-(--v3-bg) text-(--v3-teal)" />
                 <span className="text-sm text-(--v3-text) group-hover:text-(--v3-teal) transition-colors">Weekly reports</span>
              </label>
           </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
