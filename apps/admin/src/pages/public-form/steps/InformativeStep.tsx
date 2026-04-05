import { ArrowRight } from 'lucide-react'
import type { FormStep } from '../types'

interface InformativeStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
  onNext: () => void
}

export function InformativeStep({ step, primaryColor, appliedHeadingFont, onNext }: InformativeStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title}
      </h1>
      <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-md">
        {step.description}
      </p>
      <button 
        onClick={onNext}
        style={{ backgroundColor: primaryColor }}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        {(step.config as Record<string, string | boolean>)?.buttonText || 'Continue'} <ArrowRight size={22} />
      </button>
    </div>
  )
}
