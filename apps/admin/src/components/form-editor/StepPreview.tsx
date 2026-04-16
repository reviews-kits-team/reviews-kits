import { Star, CheckCircle, Plus } from 'lucide-react'
import type { FormStep, FormBranding, StepField } from './types'

interface StepPreviewProps {
  step: FormStep
  branding: FormBranding
  previewMode: 'desktop' | 'mobile'
  activeStepId: string | null
  selectedElement: string | null
  onElementClick: (elementKey: string, stepId: string) => void
}

function editableCls(isSelected: boolean) {
  return `cursor-pointer transition-all rounded-lg p-1 border-2 ${
    isSelected ? 'border-dashed' : 'border-transparent hover:border-black/5'
  }`
}

function EditableTitle({
  step,
  activeStepId,
  selectedElement,
  headingFont,
  onElementClick,
  extraCls = '',
}: {
  step: FormStep
  activeStepId: string | null
  selectedElement: string | null
  headingFont: string
  onElementClick: (key: string, id: string) => void
  extraCls?: string
}) {
  const isSelected = selectedElement === 'title' && activeStepId === step.id
  return (
    <h2
      onClick={() => onElementClick('title', step.id)}
      style={{ borderColor: isSelected ? '#000000' : 'transparent', fontFamily: headingFont, color: '#000000' }}
      className={`text-2xl md:text-3xl font-black tracking-tighter ${editableCls(isSelected)} ${extraCls}`}
    >
      {step.title}
    </h2>
  )
}

function EditableDescription({
  step,
  activeStepId,
  selectedElement,
  onElementClick,
}: {
  step: FormStep
  activeStepId: string | null
  selectedElement: string | null
  onElementClick: (key: string, id: string) => void
}) {
  const isSelected = selectedElement === 'description' && activeStepId === step.id
  return (
    <p
      onClick={() => onElementClick('description', step.id)}
      style={{ borderColor: isSelected ? '#000000' : 'transparent' }}
      className={`text-gray-600 ${editableCls(isSelected)}`}
    >
      {step.description}
    </p>
  )
}

function EditableButton({
  step,
  activeStepId,
  selectedElement,
  primaryColor,
  bodyFont,
  onElementClick,
  defaultLabel = 'Continue',
}: {
  step: FormStep
  activeStepId: string | null
  selectedElement: string | null
  primaryColor: string
  bodyFont: string
  onElementClick: (key: string, id: string) => void
  defaultLabel?: string
}) {
  const isSelected = selectedElement === 'buttonText' && activeStepId === step.id
  return (
    <button
      onClick={() => onElementClick('buttonText', step.id)}
      style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
      className={`text-white w-full py-4 rounded-xl text-xs font-bold shadow-xl transition-all border-2 ${
        isSelected ? 'border-dashed border-white ring-4 ring-black/10' : 'border-transparent'
      }`}
    >
      {(step.config as Record<string, string>)?.buttonText || defaultLabel}
    </button>
  )
}

function RatingDisplay({
  step,
  previewMode,
}: {
  step: FormStep
  previewMode: 'desktop' | 'mobile'
}) {
  const cfg = step.config as Record<string, string>
  return (
    <div className="flex gap-8 justify-center">
      {cfg?.ratingType === 'emojis'
        ? ['😠', '🙁', '😐', '🙂', '😍'].map((emoji) => (
            <div key={emoji} className="text-4xl filter grayscale hover:grayscale-0 transition-all cursor-default">
              {emoji}
            </div>
          ))
        : [1, 2, 3, 4, 5].map((v) => (
            <div key={v} className="p-2">
              <Star size={previewMode === 'mobile' ? 30 : 40} className="text-gray-300 fill-gray-200" />
            </div>
          ))}
    </div>
  )
}

export function StepPreview({
  step,
  branding,
  previewMode,
  activeStepId,
  selectedElement,
  onElementClick,
}: StepPreviewProps) {
  const primaryColor = branding.primaryColor || '#0D9E75'
  const headingFont = branding.headingFont || 'Inter'
  const bodyFont = branding.bodyFont || 'Inter'
  const cfg = step.config as Record<string, string | boolean>

  const fontUrl = (font: string) =>
    `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700;900&display=swap`

  const sharedProps = { step, activeStepId, selectedElement, onElementClick }

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 text-[#1a1a1a] gap-y-4 md:gap-y-6 relative overflow-y-auto"
      style={{ fontFamily: bodyFont }}
    >
      <style>{`@import url('${fontUrl(headingFont)}'); @import url('${fontUrl(bodyFont)}');`}</style>

      {branding.logoUrl && (
        <div className="mb-4 flex justify-center w-full">
          <img src={branding.logoUrl} alt="Logo" className="max-h-16 w-auto object-contain" />
        </div>
      )}

      {/* Welcome / Informative */}
      {(step.type === 'welcome' || step.type === 'informative') && (
        <div className="flex flex-col items-center gap-y-6 text-center w-full">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} />
        </div>
      )}

      {/* Rating */}
      {step.type === 'rating' && (
        <div className="flex flex-col items-center gap-y-6 text-center w-full">
          <EditableTitle {...sharedProps} headingFont={headingFont} extraCls="text-balance" />
          <EditableDescription {...sharedProps} />
          <RatingDisplay step={step} previewMode={previewMode} />
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} />
        </div>
      )}

      {/* Textarea */}
      {step.type === 'textarea' && (
        <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <textarea
            disabled
            onClick={() => onElementClick('placeholder', step.id)}
            style={{ borderColor: selectedElement === 'placeholder' && activeStepId === step.id ? '#000000' : undefined }}
            className={`w-full h-48 p-6 rounded-2xl border-2 bg-gray-50 outline-none transition-all placeholder:text-gray-400 italic cursor-pointer ${
              selectedElement === 'placeholder' && activeStepId === step.id
                ? 'border-dashed border-gray-100'
                : 'border-gray-100 hover:border-black/5'
            }`}
            placeholder={(cfg?.placeholder as string) || 'Type your testimonial here...'}
          />
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} defaultLabel="Next" />
        </div>
      )}

      {/* Attribution */}
      {step.type === 'attribution' && (
        <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-4">
              <div className="w-full h-32 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-100 mb-2">
                <Plus size={24} />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider">Add a photo</span>
              </div>
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center text-gray-600 text-xs text-left italic">
                {cfg?.collectName !== false ? 'Your name' : 'Anonymous'}
              </div>
            </div>
            {cfg?.collectEmail !== false && (
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                votre@email.com
              </div>
            )}
            {cfg?.collectCompany && (
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                Your company / website
              </div>
            )}
          </div>
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} defaultLabel="Finish" />
        </div>
      )}

      {/* Success */}
      {step.type === 'success' && (
        <div className="flex flex-col items-center gap-y-6 text-center w-full">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500 shadow-lg"
            style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}
          >
            <CheckCircle size={40} />
          </div>
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
        </div>
      )}

      {/* Core */}
      {step.type === 'core' && (
        <div className="flex flex-col items-center gap-y-6 text-center w-full">
          <EditableTitle {...sharedProps} headingFont={headingFont} extraCls="text-balance" />
          <EditableDescription {...sharedProps} />
          <RatingDisplay step={step} previewMode={previewMode} />
          <textarea
            disabled
            onClick={() => onElementClick('placeholder', step.id)}
            className={`w-full h-32 p-6 rounded-2xl border-2 bg-gray-50 outline-none transition-all placeholder:text-gray-400 italic cursor-pointer ${
              selectedElement === 'placeholder' && activeStepId === step.id
                ? 'border-dashed border-gray-400'
                : 'border-gray-100 hover:border-black/5'
            }`}
            placeholder={(cfg?.placeholder as string) || 'Tell us more about your experience...'}
          />
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} />
        </div>
      )}

      {/* Identity */}
      {step.type === 'identity' && (
        <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-4">
              <div className="w-full h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-100">
                <Plus size={20} />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider">Add a photo</span>
              </div>
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                Your name
              </div>
            </div>
            {(cfg as Record<string, boolean>)?.collectEmail !== false && (
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                votre@email.com
              </div>
            )}
            {(cfg as Record<string, boolean>)?.collectCompany && (
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                Your company / website
              </div>
            )}
            {(cfg as Record<string, boolean>)?.collectSocialLinks && (
              <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">
                linkedin.com/in/yourprofile
              </div>
            )}
          </div>
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} defaultLabel="Submit" />
        </div>
      )}

      {/* Consent */}
      {step.type === 'consent' && (
        <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <div className="w-full space-y-4 text-left border border-transparent">
            <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <input type="checkbox" disabled checked className="mt-1" />
              <span 
                className={`text-xs text-gray-800 leading-snug ${editableCls(selectedElement === 'publicLabel' && activeStepId === step.id)}`}
                onClick={() => onElementClick('publicLabel', step.id)}
              >
                {(cfg?.publicLabel as string) || 'I agree that my testimonial may be displayed publicly for marketing purposes.'}
              </span>
            </label>
            <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <input type="checkbox" disabled checked className="mt-1" />
              <span 
                className={`text-xs text-gray-800 leading-snug ${editableCls(selectedElement === 'internalLabel' && activeStepId === step.id)}`}
                onClick={() => onElementClick('internalLabel', step.id)}
              >
                {(cfg?.internalLabel as string) || 'I agree that my data may be used internally for product improvement.'}
              </span>
            </label>
          </div>
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} defaultLabel="Submit" />
        </div>
      )}

      {/* Custom */}
      {step.type === 'custom' && (
        <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
          <EditableTitle {...sharedProps} headingFont={headingFont} />
          <EditableDescription {...sharedProps} />
          <div className="w-full space-y-4 text-left">
            {(((step.config as Record<string, unknown>)?.fields || []) as StepField[]).map((field) => (
              <div key={field.id} className="space-y-2">
                <p className="text-xs font-bold text-gray-700">{field.label || 'Question'}</p>
                {field.type === 'text' && (
                  <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-xs italic">
                    {field.placeholder || 'Your answer...'}
                  </div>
                )}
                {field.type === 'nps' && (
                  <div className="flex gap-1">
                    {Array.from({ length: 11 }, (_, i) => (
                      <div key={i} className="flex-1 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold text-center">
                        {i}
                      </div>
                    ))}
                  </div>
                )}
                {field.type === 'choice' && (
                  <div className="space-y-2">
                    {(field.options || []).map((opt, i) => (
                      <div key={i} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 text-xs text-left flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {field.type === 'grid' && (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="p-1 text-gray-400 font-normal text-left" />
                          {(field.options || ['1', '2', '3', '4', '5']).map((col) => (
                            <th key={col} className="p-1 text-gray-400 font-bold text-center">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(field.rows || []).map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="p-2 text-gray-600 text-left text-[10px]">{row}</td>
                            {(field.options || ['1', '2', '3', '4', '5']).map((col) => (
                              <td key={col} className="p-2 text-center">
                                <div className="w-3 h-3 rounded-full border-2 border-gray-200 mx-auto" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
          <EditableButton {...sharedProps} primaryColor={primaryColor} bodyFont={bodyFont} />
        </div>
      )}
    </div>
  )
}
