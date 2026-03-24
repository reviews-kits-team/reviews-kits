import { SettingsLayout } from '../components/dashboard/settings-layout'
import { Lock, Shield, Fingerprint } from 'lucide-react'

export default function SecurityPage() {
  return (
    <SettingsLayout 
      title="Security" 
      subtitle="Protect your account with advanced security settings."
    >
      <div className="space-y-8">
        {/* Password Reset Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                 <Lock size={18} />
              </div>
              <h3 className="font-bold text-[var(--v3-text)]">Changer mon mot de passe</h3>
           </div>

           <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-muted2)] ml-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-rose-500/50 rounded-xl py-3 px-4 text-sm text-[var(--v3-text)] outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-muted2)] ml-1">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 px-4 text-sm text-[var(--v3-text)] outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-muted2)] ml-1">Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 px-4 text-sm text-[var(--v3-text)] outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
           </div>

           <button className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:border-rose-500/30 transition-all shadow-xl">
             Update password
           </button>
        </section>

        {/* 2FA Section */}
        <section className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
              <Shield size={80} />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-[var(--v3-teal-dim)] border border-[var(--v3-teal)]/20 flex items-center justify-center text-[var(--v3-teal)]">
                    <Fingerprint size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-[var(--v3-text)]">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-[var(--v3-muted2)] mt-0.5">Add an extra layer of security.</p>
                 </div>
              </div>
              <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-bold transition-all text-[var(--v3-muted2)]">
                 Disabled
              </button>
           </div>
        </section>

        {/* Sessions Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                 <Shield size={18} />
              </div>
              <h3 className="font-bold text-[var(--v3-text)]">Active sessions</h3>
           </div>
           
           <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="font-mono text-[10px] bg-sky-500/10 text-sky-500 px-2 py-1 rounded">LINUX</div>
                 <div>
                    <div className="text-sm font-bold text-[var(--v3-text)]">Chrome sur Ubuntu</div>
                    <div className="text-[10px] text-[var(--v3-muted2)] uppercase tracking-wider font-bold mt-0.5">Session actuelle • Paris, FR</div>
                 </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[var(--v3-teal)] shadow-[0_0_10px_var(--v3-teal)]" />
           </div>
        </section>
      </div>
    </SettingsLayout>
  )
}
