import { SettingsLayout } from '../components/dashboard/settings-layout'
import { Globe, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Configure general options for your account and interface."
    >
      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-[var(--v3-bg3)] border border-[var(--v3-border)] flex items-center justify-center text-[var(--v3-muted2)]">
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
               </div>
               <div>
                  <h3 className="font-bold text-[var(--v3-text)]">{isDark ? 'Dark Mode' : 'Light Mode'}</h3>
                  <p className="text-xs text-[var(--v3-muted2)]">Switch between dark and light theme.</p>
               </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative cursor-pointer p-1 transition-colors duration-300 ${isDark ? 'bg-[var(--v3-teal)]' : 'bg-[var(--v3-border2)]'}`}
              aria-label="Toggle theme"
            >
               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--v3-bg3)] border border-[var(--v3-border)] flex items-center justify-center text-[var(--v3-muted2)]">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--v3-text)]">Language & Region</h3>
                <p className="text-xs text-[var(--v3-muted2)]">Default interface language.</p>
              </div>
           </div>

           <select className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl py-3 px-4 text-sm text-[var(--v3-text)] outline-none appearance-none">
              <option value="fr">Français (France)</option>
              <option value="en">English (US)</option>
           </select>
        </div>

        {/* Notifications */}
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--v3-bg3)] border border-[var(--v3-border)] flex items-center justify-center text-[var(--v3-muted2)]">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--v3-text)]">Notifications Email</h3>
                <p className="text-xs text-[var(--v3-muted2)]">Manage your notification preferences.</p>
              </div>
           </div>
           <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--v3-border)] bg-[var(--v3-bg)] text-[var(--v3-teal)]" />
                 <span className="text-sm text-[var(--v3-text)] group-hover:text-[var(--v3-teal)] transition-colors">Nouveaux formulaires reçus</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--v3-border)] bg-[var(--v3-bg)] text-[var(--v3-teal)]" />
                 <span className="text-sm text-[var(--v3-text)] group-hover:text-[var(--v3-teal)] transition-colors">Rapports hebdomadaires</span>
              </label>
           </div>
        </div>

        <button className="w-full py-3.5 bg-[var(--v3-bg3)] border border-[var(--v3-border)] text-[var(--v3-muted2)] rounded-xl font-bold text-sm transition-all opacity-50 cursor-not-allowed">
          Coming soon
        </button>
      </div>
    </SettingsLayout>
  )
}
