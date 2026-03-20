import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  delta?: string
  colorClass: string
}

export const StatCard = ({ icon, label, value, delta, colorClass }: StatCardProps) => (
  <div className="group relative bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-xl p-6 transition-all hover:border-[var(--v3-teal)]/25 hover:-translate-y-0.5 overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--v3-teal)]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="flex justify-between items-start mb-4.5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${colorClass}`}>
        {icon}
      </div>
      {delta && (
        <span className="text-[11px] font-bold tracking-tight text-[var(--v3-teal)] bg-[var(--v3-teal-dim)] px-2 py-0.5 rounded-full border border-[var(--v3-teal)]/20">
          {delta}
        </span>
      )}
    </div>
    <div className="text-[32px] font-black tracking-tighter text-[var(--v3-text)] leading-none mb-1">{value}</div>
    <div className="text-[13px] text-[var(--v3-muted2)] font-medium">{label}</div>
  </div>
)
