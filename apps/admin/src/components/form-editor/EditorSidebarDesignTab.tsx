import { Trash2, Upload } from 'lucide-react'
import { ColorPicker } from '../ui/color-picker'
import type { FormData } from './types'

interface EditorSidebarDesignTabProps {
  form: FormData
  onBrandingChange: (updates: Partial<FormData['config']['branding']>) => void
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
}

const HEADING_FONTS = ['Inter', 'Montserrat', 'Playfair Display', 'Poppins', 'Roboto', 'Syne', 'Outfit']
const BODY_FONTS = ['Inter', 'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Work Sans']

export function EditorSidebarDesignTab({
  form,
  onBrandingChange,
  onLogoUpload,
  onRemoveLogo,
}: EditorSidebarDesignTabProps) {
  const { branding } = form.config

  return (
    <div className="space-y-8">
      {/* Primary color */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">
          Primary color
        </label>
        <ColorPicker
          value={branding.primaryColor || '#0D9E75'}
          onChange={(color) => onBrandingChange({ primaryColor: color })}
          brandColors={branding.brandColors}
          onAddBrandColor={(color) => {
            const current = branding.brandColors || ['#D6C750', '#0D1E3D', '#F2F4F7']
            if (!current.includes(color)) {
              onBrandingChange({ brandColors: [...current, color] })
            }
          }}
        />
      </div>

      {/* Logo */}
      <div className="pt-6 border-t border-white/5">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">
          Brand logo
        </label>
        {branding.logoUrl ? (
          <div className="relative group">
            <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-6">
              <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <button
              onClick={onRemoveLogo}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <label className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#0D9E75]/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[#0D9E75] group-hover:bg-[#0D9E75]/10 transition-all">
              <Upload size={18} />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold block">Upload logo</span>
              <span className="text-[10px] text-white/20">PNG, JPG up to 2MB</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
          </label>
        )}
      </div>

      {/* Typography */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">
            Heading font
          </label>
          <select
            value={branding.headingFont || 'Inter'}
            onChange={(e) => onBrandingChange({ headingFont: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#0D9E75]/50 outline-none transition-all cursor-pointer"
          >
            {HEADING_FONTS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">
            Body font
          </label>
          <select
            value={branding.bodyFont || 'Inter'}
            onChange={(e) => onBrandingChange({ bodyFont: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#0D9E75]/50 outline-none transition-all cursor-pointer"
          >
            {BODY_FONTS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
