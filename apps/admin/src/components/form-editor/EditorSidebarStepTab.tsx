import { type RefObject } from 'react'
import { Trash2, Plus } from 'lucide-react'
import type { FormStep, StepField } from './types'

interface EditorSidebarStepTabProps {
  activeStep: FormStep | undefined
  activeStepId: string | null
  sidebarRefs: RefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>
  onUpdateStep: (stepId: string, updates: Partial<FormStep>) => void
  onUpdateField: (stepId: string, fieldId: string, updates: Partial<StepField>) => void
  onAddField: (stepId: string, type: StepField['type']) => void
  onRemoveField: (stepId: string, fieldId: string) => void
  onDeleteStep: (stepId: string) => void
  onToggleStepEnabled: (stepId: string) => void
}

const FIELD_LABELS: Record<StepField['type'], string> = {
  text: 'Short text',
  nps: 'NPS',
  choice: 'Choice',
  grid: 'Grid',
}

export function EditorSidebarStepTab({
  activeStep,
  sidebarRefs,
  onUpdateStep,
  onUpdateField,
  onAddField,
  onRemoveField,
  onDeleteStep,
  onToggleStepEnabled,
}: EditorSidebarStepTabProps) {
  const cfg = activeStep?.config as Record<string, string | boolean> | undefined

  const setSidebarRef = (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    const refs = sidebarRefs.current
    if (refs) refs[key] = el
  }

  return (
    <div className="space-y-6">
      {/* Current step info */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D9E75] block mb-1">
          Currently editing
        </span>
        <h3 className="text-sm font-bold truncate">
          {activeStep ? activeStep.title : 'No step selected'}
        </h3>
        <p className="text-[10px] text-white/40 mt-1 italic">
          Click on a step in the canvas to edit it.
        </p>
      </div>

      <div className="h-px bg-white/5" />

      {activeStep && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
              Step title
            </label>
            <input
              ref={setSidebarRef('title')}
              type="text"
              value={activeStep.title}
              onChange={(e) => onUpdateStep(activeStep.id, { title: e.target.value })}
              className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block text-balance">
              Step description
            </label>
            <textarea
              ref={setSidebarRef('description')}
              value={activeStep.description}
              onChange={(e) => onUpdateStep(activeStep.id, { description: e.target.value })}
              className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none min-h-25 resize-none"
            />
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0D9E75] block mb-4">
              Specific settings
            </span>

            {/* Rating style (core / rating) */}
            {(activeStep.type === 'core' || activeStep.type === 'rating') && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                  Rating style
                </label>
                <div className="flex gap-2 bg-(--v3-bg) p-1 rounded-xl border border-(--v3-border)">
                  {(['stars', 'emojis'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateStep(activeStep.id, { config: { ...activeStep.config, ratingType: type } })}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        ((cfg?.ratingType ?? 'stars') === type)
                          ? 'bg-(--v3-teal) text-white shadow-lg'
                          : 'text-(--v3-muted2) hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {type === 'stars' ? 'Stars' : 'Emojis'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder (core / textarea) */}
            {(activeStep.type === 'core' || activeStep.type === 'textarea') && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                  Testimonial placeholder
                </label>
                <input
                  ref={setSidebarRef('placeholder')}
                  type="text"
                  value={(cfg?.placeholder as string) || ''}
                  onChange={(e) => onUpdateStep(activeStep.id, { config: { ...activeStep.config, placeholder: e.target.value } })}
                  placeholder="Tell us more about your experience..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#0D9E75]/50 outline-none transition-all"
                />
              </div>
            )}

            {/* Collect toggles (identity / attribution) */}
            {(activeStep.type === 'identity' || activeStep.type === 'attribution') && (
              <div className="space-y-4">
                {[
                  { key: 'collectEmail', label: 'Collect email', defaultOn: true },
                  { key: 'collectCompany', label: 'Collect company', defaultOn: false },
                  { key: 'collectSocialLinks', label: 'Collect social links', defaultOn: false },
                ].map(({ key, label, defaultOn }) => {
                  const boolCfg = activeStep.config as Record<string, boolean>
                  const value = boolCfg?.[key] ?? defaultOn
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold">{label}</span>
                      <button
                        onClick={() => onUpdateStep(activeStep.id, { config: { ...activeStep.config, [key]: !value } })}
                        className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Consent labels (consent) */}
            {activeStep.type === 'consent' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                    Public Consent Text
                  </label>
                  <textarea
                    ref={setSidebarRef('publicLabel')}
                    value={(cfg?.publicLabel as string) || ''}
                    onChange={(e) => onUpdateStep(activeStep.id, { config: { ...activeStep.config, publicLabel: e.target.value } })}
                    placeholder="I agree that my testimonial may be displayed..."
                    className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                    Internal Consent Text
                  </label>
                  <textarea
                    ref={setSidebarRef('internalLabel')}
                    value={(cfg?.internalLabel as string) || ''}
                    onChange={(e) => onUpdateStep(activeStep.id, { config: { ...activeStep.config, internalLabel: e.target.value } })}
                    placeholder="I agree that my data may be used internally..."
                    className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {/* Custom fields */}
            {activeStep.type === 'custom' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-(--v3-muted2) block">Fields</span>
                {(((activeStep.config as Record<string, unknown>)?.fields || []) as StepField[]).map((field) => (
                  <div key={field.id} className="bg-(--v3-bg) border border-(--v3-border) rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                        {field.type}
                      </span>
                      <button
                        onClick={() => onRemoveField(activeStep.id, field.id)}
                        className="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => onUpdateField(activeStep.id, field.id, { label: e.target.value })}
                      placeholder="Question label..."
                      className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
                    />
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => onUpdateField(activeStep.id, field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#0D9E75]/50 outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  {(['text', 'nps', 'choice', 'grid'] as const).map((fieldType) => (
                    <button
                      key={fieldType}
                      onClick={() => onAddField(activeStep.id, fieldType)}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-[#0D9E75]/10 hover:border-[#0D9E75]/30 text-white/40 hover:text-white/80 transition-all"
                    >
                      <Plus size={10} />
                      {FIELD_LABELS[fieldType]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Button text (all except success) */}
            {activeStep.type !== 'success' && (
              <div className="pt-6 border-t border-white/5 mt-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                  Button text
                </label>
                <input
                  ref={setSidebarRef('buttonText')}
                  type="text"
                  value={(cfg?.buttonText as string) || ''}
                  onChange={(e) => onUpdateStep(activeStep.id, { config: { ...activeStep.config, buttonText: e.target.value } })}
                  placeholder="Continue"
                  className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
                />
              </div>
            )}

            {/* Redirect URL (success only) */}
            {activeStep.type === 'success' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-(--v3-muted2) mb-3 block">
                  Redirect URL (optional)
                </label>
                <input
                  type="text"
                  value={((activeStep.config as Record<string, string>)?.redirectUrl) || ''}
                  onChange={(e) => onUpdateStep(activeStep.id, { config: { ...activeStep.config, redirectUrl: e.target.value } })}
                  placeholder="https://yoursite.com"
                  className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl px-4 py-3 text-sm focus:border-(--v3-teal)/50 transition-all outline-none"
                />
              </div>
            )}
          </div>

          {/* Enable toggle + delete */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Enable this step</span>
              <button
                onClick={() => onToggleStepEnabled(activeStep.id)}
                className={`w-10 h-5 rounded-full transition-all relative ${activeStep.isEnabled ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeStep.isEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {(!activeStep.locked && activeStep.type !== 'consent') && (
              <button
                onClick={() => onDeleteStep(activeStep.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <Trash2 size={12} />
                Delete this step
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
