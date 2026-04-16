import { ArrowLeft, Loader2 } from 'lucide-react'
import type { FormStep } from '../types'

interface ConsentStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
  consentPublic: boolean
  consentInternal: boolean
  setConsentPublic: (val: boolean) => void
  setConsentInternal: (val: boolean) => void
  submitting: boolean
  onNext: () => void
  onBack: () => void
}

export function ConsentStep({ 
  step, 
  primaryColor, 
  appliedHeadingFont, 
  consentPublic,
  consentInternal,
  setConsentPublic,
  setConsentInternal,
  submitting,
  onNext, 
  onBack 
}: ConsentStepProps) {
  const publicLabel = (step.config as Record<string, string>)?.publicLabel || 'I agree that my testimonial may be displayed publicly for marketing purposes.'
  const internalLabel = (step.config as Record<string, string>)?.internalLabel || 'I agree that my data may be used internally for product improvement.'
  
  const isValid = consentPublic || consentInternal

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title || 'Data Consent'}
      </h1>
      <p className="text-gray-600 mb-10 text-xl leading-relaxed">
        {step.description || 'Please let us know how we can use your feedback.'}
      </p>

      <div className="w-full space-y-6 mb-10 text-left">
        <label className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
          <input 
            type="checkbox" 
            checked={consentPublic} 
            onChange={(e) => setConsentPublic(e.target.checked)} 
            className="mt-1 w-6 h-6 text-black rounded border-gray-300 focus:ring-black"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-lg text-gray-800 leading-snug">{publicLabel}</span>
        </label>

        <label className="flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
          <input 
            type="checkbox" 
            checked={consentInternal} 
            onChange={(e) => setConsentInternal(e.target.checked)} 
            className="mt-1 w-6 h-6 text-black rounded border-gray-300 focus:ring-black"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-lg text-gray-800 leading-snug">{internalLabel}</span>
        </label>
      </div>

      <div className="flex gap-4 w-full">
        <button onClick={onBack}
          className="px-6 py-5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-bold"
        >
          <ArrowLeft size={22} />
        </button>
        <button
          disabled={!isValid || submitting}
          onClick={onNext}
          style={{ backgroundColor: isValid ? primaryColor : '#E5E7EB' }}
          className="flex-1 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {submitting ? <Loader2 size={28} className="animate-spin" /> : ((step.config as Record<string, string>)?.buttonText || 'Submit')}
        </button>
      </div>
    </div>
  )
}
