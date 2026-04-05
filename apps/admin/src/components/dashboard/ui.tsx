export const Stars = ({ rating, size = 13 }: { rating: number | null, size?: number }) => {
  if (rating === null) return null
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1" style={{ fontSize: size }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rounded ? "text-(--v3-teal)" : "text-(--v3-bg3)"}>
          ★
        </span>
      ))}
    </div>
  )
}

export const Badge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; active: boolean; color: string }> = {
    active: { label: 'Active', active: true, color: 'var(--v3-teal)' },
    draft: { label: 'Draft', active: false, color: 'white' },
    approved: { label: 'Approved', active: true, color: 'var(--v3-teal)' },
    pending: { label: 'Pending', active: true, color: '#f59e0b' },
    rejected: { label: 'Rejected', active: false, color: '#e84040' },
  }

  const { label, active, color } = config[status.toLowerCase()] || config.draft
  
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-0 rounded-full text-[6px] font-black uppercase tracking-[0.15em] border backdrop-blur-md transition-all whitespace-nowrap ${
      active 
        ? `bg-[${color}]/10 text-[${color}] border-[${color}]/20 shadow-[0_0_15px_rgba(45,212,191,0.05)]` 
        : 'bg-white/5 text-(--v3-muted2) border-white/10'
    }`} style={{ color: active ? color : undefined, borderColor: active ? `${color}33` : undefined, backgroundColor: active ? `${color}1a` : undefined }}>
      <div className="relative flex items-center justify-center">
        <div className={`w-0.75 h-0.75 rounded-full ${active ? '' : 'bg-white/20'}`} style={{ backgroundColor: active ? color : undefined }} />
        {active && (
          <div className="absolute w-0.75 h-0.75 rounded-full animate-ping opacity-60" style={{ backgroundColor: color }} />
        )}
      </div>
      {label}
    </div>
  )
}

export const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`w-4 h-4 rounded border transition-all cursor-pointer flex items-center justify-center ${
        checked 
          ? 'bg-(--v3-teal) border-(--v3-teal) shadow-[0_0_10px_rgba(45,212,191,0.2)]' 
          : 'bg-white/5 border-white/20 hover:border-white/40'
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}
