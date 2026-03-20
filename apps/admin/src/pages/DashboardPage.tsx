import { useState, useMemo } from 'react'
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
import { FormCard } from '../components/dashboard/form-card'
import { DetailView } from '../components/dashboard/detail-view'

// --- Mock Data ---

const FORMS = [
  { id: 1, name: "SaaS Product Feedback", status: "active", responses: 142, rating: 4.6, completion: 78, created: "12 jan. 2025" },
  { id: 2, name: "Onboarding Experience", status: "active", responses: 89, rating: 4.2, completion: 65, created: "28 jan. 2025" },
  { id: 3, name: "Post-Purchase Survey", status: "draft", responses: 0, rating: null, completion: 0, created: "5 fév. 2025" },
  { id: 4, name: "Customer Support Quality", status: "active", responses: 214, rating: 3.9, completion: 82, created: "2 fév. 2025" },
  { id: 5, name: "Beta Feature Test v2", status: "draft", responses: 12, rating: 4.0, completion: 43, created: "10 fév. 2025" },
]

export default function DashboardPage() {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null)
  
  const selectedForm = useMemo(() => 
    FORMS.find(f => f.id === selectedFormId), [selectedFormId]
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <StatCard icon={<MessageSquare size={18} />} label="Total reviews" value="445" delta="↑ +18%" colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]" />
          <StatCard icon={<CheckCircle2 size={18} />} label="Taux de complétion" value="72%" delta="↑ +5%" colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500" />
          <StatCard icon={<Star size={18} />} label="Note moyenne" value="4.3" colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" />
          <StatCard icon={<Users size={18} />} label="Répondants uniques" value="391" delta="↑ +9%" colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500" />
        </div>

        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)]">// mes formulaires</span>
            <span className="text-[11px] font-semibold bg-[var(--v3-bg3)] border border-[var(--v3-border2)] text-[var(--v3-muted2)] px-2.5 py-0.5 rounded-full">
              {FORMS.length} formulaires
            </span>
          </div>
          <button className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={14} strokeWidth={2.5} />
            Ajouter un formulaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FORMS.map(f => (
            <FormCard key={f.id} form={f} onClick={() => setSelectedFormId(f.id)} />
          ))}
          <div className="group min-h-[240px] flex flex-col items-center justify-center gap-3.5 bg-transparent border border-dashed border-white/10 rounded-2xl p-6.5 cursor-pointer text-[var(--v3-muted)] hover:border-[var(--v3-teal)]/40 hover:bg-[var(--v3-teal)]/5 hover:text-[var(--v3-teal)] transition-all">
            <div className="w-12 h-12 rounded-full border-[1.5px] border-dashed border-current flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-90">
              +
            </div>
            <span className="text-sm font-medium">Nouveau formulaire</span>
          </div>
        </div>
      </main>
    </div>
  )
}
