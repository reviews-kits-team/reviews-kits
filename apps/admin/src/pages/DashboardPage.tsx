import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  Users,
  Copy,
  RefreshCw,
  Key
} from 'lucide-react'

// Layout/Dashboard Components
import { TopBar } from '../components/dashboard/top-bar'
import { StatCard } from '../components/dashboard/stat-card'
import { FormCard } from '../components/dashboard/form-card'
import { DetailView } from '../components/dashboard/detail-view'
import { CreateFormModal } from '../components/dashboard/create-form-modal'
import type { DashboardForm, ApiKeys } from '../components/dashboard/types'

export default function DashboardPage() {
  const [forms, setForms] = useState<DashboardForm[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [showKeySecret, setShowKeySecret] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, keysRes] = await Promise.all([
          fetch('/api/v1/forms'),
          fetch('/api/v1/api-keys')
        ]);
        
        if (formsRes.ok) setForms(await formsRes.json());
        if (keysRes.ok) setApiKeys(await keysRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  const handleRotateKeys = async () => {
    if (!confirm("Es-tu sûr de vouloir régénérer tes clés ? Les anciennes ne fonctionneront plus.")) return;
    try {
      const res = await fetch('/api/v1/api-keys/rotate', { method: 'POST' });
      if (res.ok) setApiKeys(await res.json());
    } catch (error) {
      console.error("Failed to rotate keys", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copié dens le presse-papier !");
  };

  const selectedForm = useMemo(() => 
    forms.find(f => f.id === selectedFormId), [selectedFormId, forms]
  )

  if (selectedFormId && selectedForm) {
    return (
      <DetailView 
        form={selectedForm} 
        onBack={() => setSelectedFormId(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
        <div className="mb-10">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
            // dashboard
          </span>
          <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tighter text-[var(--v3-text)] leading-[1.1] mb-2">
            Bonjour, Richard 👋
          </h1>
          <p className="text-[15px] text-[var(--v3-muted2)]">Vue d'ensemble de ta plateforme de reviews.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <StatCard icon={<MessageSquare size={18} />} label="Total reviews" value="0" delta="↑ 0%" colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Taux de complétion" value="0%" delta="↑ 0%" colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500" />
          <StatCard icon={<Star size={18} />} label="Note moyenne" value="0.0" colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" />
          <StatCard icon={<Users size={18} />} label="Répondants uniques" value="0" delta="↑ 0%" colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500" />
        </div>

        {/* Forms Section */}
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)]">// mes formulaires</span>
            <span className="text-[11px] font-semibold bg-[var(--v3-bg3)] border border-[var(--v3-border2)] text-[var(--v3-muted2)] px-2.5 py-0.5 rounded-full">
              {forms.length} formulaires
            </span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={14} strokeWidth={2.5} />
            Ajouter un formulaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {loading ? (
            <div className="col-span-full py-20 text-center text-[var(--v3-muted)] italic">Chargement...</div>
          ) : forms.length > 0 ? (
            forms.map(f => (
              <FormCard key={f.id} form={f} onClick={() => setSelectedFormId(f.id)} />
            ))
          ) : (
            <div className="col-span-full py-20 bg-[var(--v3-bg2)] border border-dashed border-white/5 rounded-2xl text-center">
              <p className="text-[var(--v3-muted)] mb-4">Tu n'as pas encore de formulaire.</p>
            </div>
          )}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="group min-h-[240px] flex flex-col items-center justify-center gap-3.5 bg-transparent border border-dashed border-white/10 rounded-2xl p-6.5 cursor-pointer text-[var(--v3-muted)] hover:border-[var(--v3-teal)]/40 hover:bg-[var(--v3-teal)]/5 hover:text-[var(--v3-teal)] transition-all"
          >
            <div className="w-12 h-12 rounded-full border-[1.5px] border-dashed border-current flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-90">
              +
            </div>
            <span className="text-sm font-medium">Nouveau formulaire</span>
          </div>
        </div>

        <CreateFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCreated={(newForm) => setForms([newForm, ...forms])}
        />

        {/* Developer Keys Section */}
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Key size={120} />
           </div>
           
           <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--v3-teal-dim)] border border-[var(--v3-teal)]/20 flex items-center justify-center text-[var(--v3-teal)]">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--v3-text)]">Clés Développeur</h2>
                <p className="text-sm text-[var(--v3-muted)]">Utilise ces clés pour intégrer ReviewKits dans ton application.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Public Key */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-teal)] mb-2 block">Clé Publique (SDK)</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--v3-text)] overflow-hidden text-ellipsis whitespace-nowrap">
                    {apiKeys?.publicKey || 'rk_pk_live_********************************'}
                  </div>
                  <button 
                    onClick={() => apiKeys && copyToClipboard(apiKeys.publicKey)}
                    className="bg-[var(--v3-bg3)] border border-[var(--v3-border)] hover:border-[var(--v3-teal)]/50 p-3 rounded-lg text-[var(--v3-muted)] hover:text-[var(--v3-teal)] transition-all"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-[11px] text-[var(--v3-muted)] mt-2 italic">Sûre pour une utilisation côté client.</p>
              </div>

              {/* Secret Key */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2 block">Clé Secrète (Backend)</label>
                <div className="flex gap-2">
                  <div 
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="flex-1 bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--v3-text)] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {showKeySecret ? (apiKeys?.secretKey || 'rk_sk_live_...') : 'rk_sk_live_••••••••••••••••••••••••••••••••'}
                  </div>
                  <button 
                    onClick={() => apiKeys && copyToClipboard(apiKeys.secretKey)}
                    className="bg-[var(--v3-bg3)] border border-[var(--v3-border)] hover:border-rose-500/50 p-3 rounded-lg text-[var(--v3-muted)] hover:text-rose-400 transition-all"
                  >
                    <Copy size={18} />
                  </button>
                  <button 
                    onClick={handleRotateKeys}
                    className="bg-[var(--v3-bg3)] border border-[var(--v3-border)] hover:border-[var(--v3-teal)]/50 p-3 rounded-lg text-[var(--v3-muted)] hover:text-[var(--v3-teal)] transition-all"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                <p className="text-[11px] text-rose-400/70 mt-2 italic">⚠️ Ne jamais partager ou exposer côté client.</p>
              </div>
            </div>
           </div>
        </div>
      </main>
    </div>
  )
}
