import { Bell } from 'lucide-react'

export const TopBar = () => (
  <header className="sticky top-0 z-[200] h-16 flex items-center border-b border-[var(--v3-border)] bg-[var(--v3-bg)]/90 backdrop-blur-xl">
    <div className="flex items-center justify-between w-full max-w-[1140px] mx-auto px-6">
      <a href="#" className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
        <div className="w-7 h-7 rounded-lg bg-[var(--v3-teal)] flex items-center justify-center text-sm shadow-[0_0_16px_var(--v3-teal-glow)] text-white">
          ★
        </div>
        Reviewskits
      </a>
      <div className="flex items-center gap-2.5">
        <button className="relative flex items-center justify-center p-2 rounded-lg bg-[var(--v3-bg2)] border border-[var(--v3-border)] text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:border-[var(--v3-border2)] transition-all">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--v3-red)] rounded-full border border-[var(--v3-bg2)]" />
        </button>
        <div className="flex items-center gap-2.5 bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-full py-1.5 pl-1.5 pr-3.5 cursor-pointer hover:border-[var(--v3-border2)] transition-all">
          <div className="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-[var(--v3-teal)] to-[#0a6e52] flex items-center justify-center text-[11px] font-bold text-white">
            RK
          </div>
          <span className="text-[13px] font-semibold text-[var(--v3-text)]">Richard K.</span>
        </div>
      </div>
    </div>
  </header>
)
