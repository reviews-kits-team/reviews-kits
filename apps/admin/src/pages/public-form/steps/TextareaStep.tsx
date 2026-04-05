import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { FormStep } from '../types'

interface TextareaStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
  content: string
  setContent: (content: string) => void
  onNext: () => void
  onBack: () => void
}

export function TextareaStep({ 
  step, 
  primaryColor, 
  appliedHeadingFont, 
  content, 
  setContent, 
  onNext, 
  onBack 
}: TextareaStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title}
      </h1>
      <p className="text-gray-600 mb-8 text-xl leading-relaxed">{step.description}</p>
      
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={((step.config as Record<string, string | boolean>)?.placeholder as string) || "Type your testimonial here..."}
        className="w-full h-48 p-8 rounded-[2rem] border-2 border-gray-100 bg-gray-50 mb-8 focus:ring-4 focus:ring-gray-100 focus:border-gray-200 outline-none transition-all text-black text-lg resize-none placeholder:text-gray-400"
      />

      <div className="flex gap-4 w-full">
        <button 
          onClick={onBack}
          className="px-6 py-5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-all font-bold"
        >
          <ArrowLeft size={22} />
        </button>
        <button 
          disabled={content.length < 5}
          onClick={onNext}
          style={{ backgroundColor: content.length >= 5 ? primaryColor : '#E5E7EB' }}
          className="flex-1 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {(step.config as Record<string, string | boolean>)?.buttonText || 'Next'} <ArrowRight size={22} />
        </button>
      </div>
    </div>
  )
}
