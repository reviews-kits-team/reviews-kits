import { SettingsLayout } from '../components/dashboard/settings-layout'
import { authClient } from '../lib/auth-client'
import { Camera, Mail, User as UserIcon } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = authClient.useSession()

  return (
    <SettingsLayout 
      title="Mon Profil" 
      subtitle="Gère tes informations personnelles et ton identité visuelle."
    >
      <div className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6 relative overflow-hidden group">
           <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--v3-teal)] to-[#0a6e52] flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--v3-bg3)] border border-[var(--v3-border)] flex items-center justify-center text-[var(--v3-muted2)] hover:text-[var(--v3-teal)] transition-all shadow-lg">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-[var(--v3-text)] text-lg">Photo de profil</h3>
                <p className="text-xs text-[var(--v3-muted2)] mt-1">Cliquez sur l'icône pour modifier votre avatar.</p>
              </div>
           </div>
        </section>

        {/* Basic Info Form */}
        <section className="space-y-6">
           <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Nom Complet</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                    <UserIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    defaultValue={session?.user?.name || ''}
                    className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                    placeholder="Ton nom..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Adresse Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    defaultValue={session?.user?.email || ''}
                    disabled
                    className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] opacity-50 cursor-not-allowed rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none"
                  />
                </div>
                <p className="text-[10px] text-amber-500/70 ml-1 italic italic">L'email ne peut pas être modifié pour le moment.</p>
              </div>
           </div>

           <button className="w-full py-3.5 bg-[var(--v3-teal)] text-white rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all">
             Enregistrer les modifications
           </button>
        </section>
      </div>
    </SettingsLayout>
  )
}
