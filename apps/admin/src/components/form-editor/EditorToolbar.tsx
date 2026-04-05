import { ChevronLeft, Save, Smartphone, Monitor, Link, Copy, Check, ArrowRight, Plus } from 'lucide-react'

interface EditorToolbarProps {
  formName: string
  onNameChange: (name: string) => void
  previewMode: 'desktop' | 'mobile'
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void
  showSharePopover: boolean
  onSharePopoverToggle: () => void
  publicId: string
  copied: boolean
  onCopyLink: () => void
  onSave: () => void
  onBack: () => void
}

export function EditorToolbar({
  formName,
  onNameChange,
  previewMode,
  onPreviewModeChange,
  showSharePopover,
  onSharePopoverToggle,
  publicId,
  copied,
  onCopyLink,
  onSave,
  onBack,
}: EditorToolbarProps) {
  const shareUrl = `${window.location.origin}/f/${publicId}`

  return (
    <div className="mb-6 flex items-center justify-between gap-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex-1 max-w-md">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-(--v3-teal) block opacity-60">
            Editor
          </span>
          <input
            value={formName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-base font-bold tracking-tight text-(--v3-text) focus:ring-0 outline-none placeholder:opacity-20"
            placeholder="Form name..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Preview mode toggle */}
        <div className="hidden lg:flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            <Smartphone size={16} />
          </button>
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            <Monitor size={16} />
          </button>
        </div>

        {/* Share popover */}
        <div className="relative">
          <button
            onClick={onSharePopoverToggle}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10"
          >
            <Link size={14} />
            Share
          </button>

          {showSharePopover && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Public Link</span>
                  <button onClick={onSharePopoverToggle} className="text-white/20 hover:text-white">
                    <Plus size={14} className="rotate-45" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2 overflow-hidden">
                  <span className="text-[10px] text-white/40 truncate flex-1">{shareUrl}</span>
                  <button
                    onClick={onCopyLink}
                    className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-[#0D9E75] text-white' : 'hover:bg-white/10 text-white/40'}`}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <a
                  href={`/f/${publicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#0D9E75] hover:underline flex items-center gap-1 mt-1"
                >
                  Open link <ArrowRight size={10} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-[#0D9E75] hover:bg-[#0BA87E] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#0D9E75]/20"
        >
          <Save size={14} />
          Save
        </button>
      </div>
    </div>
  )
}
