import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  Users
} from 'lucide-react'

// Layout/Dashboard Components
import { TopBar } from '../components/dashboard/top-bar'
import { StatCard } from '../components/dashboard/stat-card'
import { FormTable } from '../components/dashboard/form-table'
import { DetailView } from '../components/dashboard/detail-view'
import { CreateFormModal } from '../components/dashboard/create-form-modal'
import type { DashboardForm } from '../components/dashboard/types'
import { authClient } from '../lib/auth-client'

export default function DashboardPage() {
  const { data: session } = authClient.useSession()
  const [forms, setForms] = useState<DashboardForm[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/forms');
        if (res.ok) setForms(await res.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

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

  const userName = session?.user?.name?.split(' ')[0] || 'Utilisateur'

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
        <div className="mb-10">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
            // dashboard
          </span>
          <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tighter text-[var(--v3-text)] leading-[1.1] mb-2">
            Bonjour, {userName} 👋
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

        <div className="mb-20">
          {loading ? (
            <div className="py-20 text-center text-[var(--v3-muted)] italic">Chargement...</div>
          ) : forms.length > 0 ? (
            <FormTable 
              forms={forms} 
              onReorder={setForms}
              onOpenForm={setSelectedFormId}
            />
          ) : (
            <div className="py-20 bg-[var(--v3-bg2)] border border-dashed border-white/5 rounded-2xl text-center">
              <p className="text-[var(--v3-muted)] mb-4">Tu n'as pas encore de formulaire.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-[var(--v3-teal)] font-bold hover:underline"
              >
                Créer ton premier formulaire
              </button>
            </div>
          )}
        </div>

        <CreateFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCreated={(newForm) => setForms([newForm, ...forms])}
        />
      </main>
    </div>
  )
}
