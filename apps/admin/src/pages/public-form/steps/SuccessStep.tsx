import { CheckCircle } from 'lucide-react'
import type { FormStep } from '../types'

interface SuccessStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
}

export function SuccessStep({ step, primaryColor, appliedHeadingFont }: SuccessStepProps) {
  return (
    <div className="animate-in zoom-in-95 duration-1000 w-full flex flex-col items-center">
      <div 
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner animate-bounce"
      >
        <CheckCircle size={64} />
      </div>
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title}
      </h1>
      <p className="text-gray-600 text-xl leading-relaxed max-w-md">
        {step.description}
      </p>
    </div>
  )
}
