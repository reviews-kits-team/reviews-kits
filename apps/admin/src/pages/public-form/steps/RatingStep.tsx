import { Star, ArrowRight } from 'lucide-react'
import type { FormStep } from '../types'

interface RatingStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
  rating: number
  setRating: (rating: number) => void
  onNext: () => void
}

export function RatingStep({ 
  step, 
  primaryColor, 
  appliedHeadingFont, 
  rating, 
  setRating, 
  onNext 
}: RatingStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title}
      </h1>
      <p className="text-gray-600 mb-10 text-xl leading-relaxed">{step.description}</p>
      
      <div className="flex gap-4 justify-center mb-12">
        {(step.config as Record<string, string | boolean>)?.ratingType === 'emojis' ? (
          ['😠', '🙁', '😐', '🙂', '😍'].map((emoji, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className={`text-5xl transition-all hover:scale-125 ${rating === i + 1 ? 'scale-125 grayscale-0' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
            >
              {emoji}
            </button>
          ))
        ) : (
          [1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => setRating(val)}
              className="p-1 transition-all hover:scale-110 group focus:outline-none"
            >
              <Star 
                size={52} 
                className={`transition-all ${rating >= val ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 group-hover:text-gray-400 fill-gray-200'}`} 
              />
            </button>
          )))}
      </div>

      <button 
        disabled={rating === 0}
        onClick={onNext}
        style={{ backgroundColor: rating > 0 ? primaryColor : '#E5E7EB' }}
        className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {(step.config as Record<string, string | boolean>)?.buttonText || 'Continue'} <ArrowRight size={22} />
      </button>
    </div>
  )
}
