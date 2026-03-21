import { MoreHorizontal, MessageSquare, Star, Percent } from 'lucide-react'
import { Stars, Badge } from './ui.tsx'
import type { DashboardForm } from './types'

export const FormCard = ({ form, onClick }: { form: DashboardForm, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group relative bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-5 cursor-pointer transition-all hover:border-[var(--v3-teal)]/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
  >
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--v3-teal)]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    
    <div className="flex justify-between items-start gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[var(--v3-teal-dim)] border border-[var(--v3-teal)]/20 flex items-center justify-center text-lg shrink-0 overflow-hidden">
          📋
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold tracking-tight text-[var(--v3-text)] truncate leading-tight mb-0.5">{form.name}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--v3-muted2)] flex items-center gap-1.5 leading-none">
            <div className="w-1 h-1 rounded-full bg-[var(--v3-teal)] shadow-[0_0_8px_var(--v3-teal)]" />
            {new Date(form.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>
      <button className="text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:bg-white/5 p-1 rounded-md transition-colors shrink-0" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal size={18} />
      </button>
    </div>

    <div className="flex items-center gap-2 mb-4">
      <Badge status={form.isActive ? 'active' : 'draft'} />
      {form.rating && (
        <div className="flex items-center gap-1.5 ml-auto">
          <Stars rating={form.rating} />
          <span className="text-[11px] font-bold text-[var(--v3-text)] opacity-60">{form.rating}</span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-3 gap-1.5 mb-5">
      {[
        { val: form.responses ?? 0, lbl: "Réponses", icon: <MessageSquare size={10} className="text-[var(--v3-teal)] opacity-60" /> },
        { val: form.rating || "—", lbl: "Note moy.", icon: <Star size={10} className="text-[var(--v3-teal)] opacity-60" /> },
        { val: `${form.completion ?? 0}%`, lbl: "Complétion", icon: <Percent size={10} className="text-[var(--v3-teal)] opacity-60" /> },
      ].map((s, i) => (
        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg py-2 px-2.5 transition-all group-hover:bg-white/[0.04] group-hover:border-white/10">
          <div className="flex items-center gap-1.5 mb-1 opacity-50">
            {s.icon}
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--v3-muted2)] truncate">{s.lbl}</span>
          </div>
          <div className="text-sm font-black tracking-tight text-[var(--v3-text)] leading-none">{s.val}</div>
        </div>
      ))}
    </div>

    <div className="relative pt-2">
      <div className="flex justify-between items-center mb-1.5">
         <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--v3-muted2)] opacity-40">Progress</span>
         <span className="text-[10px] font-black text-[var(--v3-teal)] opacity-80">{form.completion ?? 0}%</span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--v3-teal)] to-[var(--v3-teal-glow)] transition-all duration-1000 shadow-[0_0_8px_var(--v3-teal)]" style={{ width: `${form.completion ?? 0}%` }} />
      </div>
    </div>
  </div>
)
