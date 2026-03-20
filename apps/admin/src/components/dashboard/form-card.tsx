import { MoreHorizontal } from 'lucide-react'
import { Stars, Badge } from './ui.tsx'
import type { DashboardForm } from './types'

export const FormCard = ({ form, onClick }: { form: DashboardForm, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group relative bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6.5 cursor-pointer transition-all hover:border-[var(--v3-teal)]/30 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
  >
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--v3-teal)]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="flex justify-between items-start mb-4.5">
      <div className="w-10.5 h-10.5 rounded-xl bg-[var(--v3-teal-dim)] border border-[var(--v3-teal)]/20 flex items-center justify-center text-lg">
        📋
      </div>
      <button className="text-[var(--v3-muted)] hover:text-[var(--v3-text)] hover:bg-white/5 p-1 rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal size={18} />
      </button>
    </div>
    <div className="text-[15px] font-bold tracking-tight text-[var(--v3-text)] mb-1">{form.name}</div>
    <div className="text-xs text-[var(--v3-muted)] mb-3.5">Créé le {form.created}</div>
    <div className="mb-4.5">
      <Badge status={form.status} />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-4.5">
      {[
        { val: form.responses, lbl: "Réponses" },
        { val: form.rating || "—", lbl: "Note moy." },
        { val: `${form.completion}%`, lbl: "Complétion" },
      ].map((s, i) => (
        <div key={i} className="bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl py-2.5 px-3">
          <div className="text-[17px] font-extrabold tracking-tight text-[var(--v3-text)] leading-none">{s.val}</div>
          <div className="text-[10px] text-[var(--v3-muted)] font-medium mt-1">{s.lbl}</div>
        </div>
      ))}
    </div>
    <div className="h-6 flex items-center mb-3.5">
      {form.rating && (
        <div className="flex items-center gap-1.5">
          <Stars rating={form.rating} />
          <span className="text-xs font-semibold text-[var(--v3-text)]">{form.rating} / 5</span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] text-[var(--v3-muted)] font-medium shrink-0">Complétion</span>
      <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--v3-teal)] transition-all duration-1000" style={{ width: `${form.completion}%` }} />
      </div>
      <span className="text-[11px] text-[var(--v3-muted2)] font-bold shrink-0 w-7 text-right">{form.completion}%</span>
    </div>
  </div>
)
