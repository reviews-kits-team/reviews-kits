import { useMemo } from 'react'
import { 
  ChevronLeft, 
  Share2, 
  MessageSquare, 
  Star, 
  Users,
  TrendingUp
} from 'lucide-react'
import { TopBar } from './top-bar'
import { StatCard } from './stat-card'
import { Stars, Badge } from './ui.tsx'
import type { DashboardForm } from './types'

// --- Mock Data for Detail View ---
const BARS = [8, 14, 11, 22, 19, 31, 27, 38, 34, 45, 41, 52]
const MAX_BAR = 52
const LBLS = ["J1", "J8", "J15", "J22", "J29", "F5", "F12", "F19", "F26", "M5", "M12", "M19"]
const STAR_DATA = [
  { s: 5, n: 68, c: "var(--v3-teal)" },
  { s: 4, n: 42, c: "#0a7d5c" },
  { s: 3, n: 18, c: "#ca8a04" },
  { s: 2, n: 9, c: "#ea580c" },
  { s: 1, n: 5, c: "#e84040" }
]
const REVS = [
  { av: "SM", name: "Sophie M.", bg: "linear-gradient(135deg,#0D9E75,#0a6e52)", r: 5, date: "2h", txt: "Absolutely love the new interface. Clean, fast, and intuitive. Best review tool I've used." },
  { av: "TR", name: "Théo R.", bg: "linear-gradient(135deg,#7c3aed,#4f46e5)", r: 4, date: "5h", txt: "Really solid product. Would love to see better CSV export options in the next release." },
  { av: "CD", name: "Camille D.", bg: "linear-gradient(135deg,#f59e0b,#d97706)", r: 5, date: "1j", txt: "Switched from Typeform and never looked back. The analytics view alone is worth it." },
  { av: "LB", name: "Lucas B.", bg: "linear-gradient(135deg,#e05454,#c03030)", r: 3, date: "2j", txt: "Good overall, but the mobile experience needs some polish. Desktop is flawless though." },
]

interface DetailViewProps {
  form: DashboardForm
  onBack: () => void
}

export const DetailView = ({ form, onBack }: DetailViewProps) => {
  const totReviews = useMemo(() => STAR_DATA.reduce((a, b) => a + b.n, 0), [])

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-lg px-4 py-2 text-[13px] font-medium text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:border-[var(--v3-border2)] transition-all mb-8"
        >
          <ChevronLeft size={13} />
          Retour aux formulaires
        </button>

        <div className="mb-8">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
            // formulaire
          </span>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-[clamp(20px,2.5vw,28px)] font-extrabold tracking-tighter text-[var(--v3-text)] mb-2">
                {form.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge status={form.isActive ? 'active' : 'draft'} />
                {form.rating && (
                  <div className="flex items-center gap-1">
                    <Stars rating={form.rating} />
                    <span className="text-[13px] font-semibold text-[var(--v3-text)]">{form.rating}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Share2 size={13} />
              Partager le formulaire
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<MessageSquare size={18} />} label="Total reviews" value={form.responses || 0} delta="↑ +12%" colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]" />
          <StatCard icon={<TrendingUp size={18} />} label="Complétion" value={`${form.completion || 0}%`} delta="↑ +4%" colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500" />
          <StatCard icon={<Star size={18} />} label="Note moyenne" value={form.rating || "—"} colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" />
          <StatCard icon={<Users size={18} />} label="Répondants uniques" value={Math.round((form.responses || 0) * 0.87)} colorClass="bg-purple-500/10 border-purple-500/20 text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-6">
          <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
            <div className="text-sm font-bold text-[var(--v3-text)] mb-1.5">Volume de reviews</div>
            <div className="text-[12px] text-[var(--v3-muted2)] mb-5">12 dernières semaines</div>
            <div className="flex items-end gap-1 h-[120px]">
              {BARS.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full group">
                  <div 
                    className="w-full bg-[var(--v3-teal)]/25 rounded-t-[3px] mt-auto group-hover:bg-[var(--v3-teal)] transition-colors cursor-pointer" 
                    style={{ height: `${Math.round((v / MAX_BAR) * 100)}%` }}
                  />
                  <div className="text-[8px] text-[var(--v3-muted)] text-center leading-none">{LBLS[i]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
            <div className="text-sm font-bold text-[var(--v3-text)] mb-1.5">Répartition des notes</div>
            <div className="text-[12px] text-[var(--v3-muted2)] mb-5">{totReviews} reviews au total</div>
            <div className="space-y-2.5 mb-2.5">
              {STAR_DATA.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs text-[var(--v3-muted2)] w-7 shrink-0">{s.s} ★</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((s.n / totReviews) * 100)}%`, backgroundColor: s.c }} />
                  </div>
                  <span className="text-[11px] text-[var(--v3-muted2)] w-5 text-right shrink-0">{s.n}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--v3-border)] mt-2">
              <span className="text-[36px] font-black tracking-tighter text-[var(--v3-text)]">{form.rating || "0.0"}</span>
              <div>
                <Stars rating={form.rating || 0} size={14} />
                <div className="text-[11px] text-[var(--v3-muted)] mt-0.5">sur 5</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-5.5 py-4.5 border-b border-[var(--v3-border)]">
            <span className="text-[15px] font-bold text-[var(--v3-text)]">// derniers avis reçus</span>
            <button className="text-xs font-semibold text-[var(--v3-teal)] hover:underline">Voir tous les avis →</button>
          </div>
          <div className="divide-y divide-[var(--v3-border)]">
            {REVS.map((r, i) => (
              <div key={i} className="flex gap-3.5 p-4 sm:p-5.5">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white" style={{ background: r.bg }}>
                  {r.av}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--v3-text)]">{r.name}</span>
                      <Stars rating={r.r} size={11} />
                    </div>
                    <span className="text-[11px] text-[var(--v3-muted)]">{r.date} ago</span>
                  </div>
                  <p className="text-[13px] text-[var(--v3-muted2)] leading-relaxed">{r.txt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
