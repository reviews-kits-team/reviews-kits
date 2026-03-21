export const Stars = ({ rating, size = 13 }: { rating: number | null, size?: number }) => {
  if (rating === null) return null
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1" style={{ fontSize: size }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rounded ? "text-[var(--v3-teal)]" : "text-[var(--v3-bg3)]"}>
          ★
        </span>
      ))}
    </div>
  )
}

export const Badge = ({ status }: { status: string }) => {
  const isActive = status === 'active'
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-[1px] rounded-full text-[8px] font-black uppercase tracking-[0.15em] border backdrop-blur-md transition-all ${
      isActive 
        ? 'bg-[var(--v3-teal)]/10 text-[var(--v3-teal)] border-[var(--v3-teal)]/20 shadow-[0_0_15px_rgba(45,212,191,0.05)]' 
        : 'bg-white/5 text-[var(--v3-muted2)] border-white/10'
    }`}>
      <div className="relative flex items-center justify-center">
        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-[var(--v3-teal)]' : 'bg-white/20'}`} />
        {isActive && (
          <div className="absolute w-1 h-1 rounded-full bg-[var(--v3-teal)] animate-ping opacity-60" />
        )}
      </div>
      {isActive ? 'Actif' : 'Brouillon'}
    </div>
  )
}
