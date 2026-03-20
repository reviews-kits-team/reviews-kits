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
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
      isActive 
        ? 'bg-[var(--v3-teal-dim)] text-[var(--v3-teal)] border-[var(--v3-teal)]/30' 
        : 'bg-white/5 text-[var(--v3-muted2)] border-[var(--v3-border2)]'
    }`}>
      {isActive && <div className="w-1 h-1 rounded-full bg-[var(--v3-teal)] animate-pulse" />}
      {!isActive && <div className="w-1 h-1 rounded-full bg-[var(--v3-muted)]" />}
      {isActive ? 'Actif' : 'Brouillon'}
    </div>
  )
}
