import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, ArrowRight, ArrowLeft, Plus, CheckCircle, Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'

// Types (Must match backend)
interface FormStep {
  id: string
  type: 'welcome' | 'rating' | 'textarea' | 'attribution' | 'success' | 'informative'
  title: string
  description?: string
  isEnabled: boolean
  config?: Record<string, unknown>
}

interface FormBranding {
  logoUrl?: string
  avatarUrl?: string
  primaryColor?: string
  headingFont?: string
  bodyFont?: string
}

interface FormData {
  id: string
  publicId: string
  name: string
  description?: string
  config: {
    steps: FormStep[]
    branding: FormBranding
  }
}

export default function PublicFormPage() {
  const { slug } = useParams()
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // Response state
  const [rating, setRating] = useState<number>(0)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [authorTitle, setAuthorTitle] = useState('')
  const [authorUrl, setAuthorUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/v1/public/forms/${slug}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Form not found')
        }
        const data = await res.json()
        // Filter enabled steps
        data.config.steps = data.config.steps.filter((s: FormStep) => s.isEnabled)
        setForm(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [slug])

  const steps = form?.config?.steps || []
  const currentStep = steps[currentStepIndex]
  const branding = form?.config?.branding
  const primaryColor = branding?.primaryColor || '#0D9E75'

  // Trigger confetti on success
  useEffect(() => {
    if (currentStep?.type === 'success') {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: [primaryColor, '#ffffff'] })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: [primaryColor, '#ffffff'] })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [currentStep?.type, primaryColor])

  const headingFont = branding?.headingFont || 'Inter'
  const bodyFont = branding?.bodyFont || 'Inter'

  const getFontUrl = (font: string) => `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700;900&display=swap`

  const handleNext = async () => {
    if (currentStep?.type === 'attribution') {
      await handleSubmit()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!form) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.publicId,
          content,
          authorName,
          authorEmail,
          authorTitle,
          authorUrl,
          rating
        })
      })
      if (res.ok) {
        // Find success step if it exists, otherwise just show success UI
        const successIdx = steps.findIndex(s => s.type === 'success')
        if (successIdx !== -1) {
          setCurrentStepIndex(successIdx)
        } else {
           // Fallback to last step
           setCurrentStepIndex(steps.length - 1)
        }
      } else {
        const data = await res.json()
        alert(data.error || "An error occurred while sending.")
      }
    } catch (error) {
      console.error("Submission failed", error)
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  )

  if (error || !form) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
      <p className="text-gray-600">{error || 'The form could not be found.'}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6" style={{ fontFamily: bodyFont }}>
      <style>
        {`
          @import url('${getFontUrl(headingFont)}');
          @import url('${getFontUrl(bodyFont)}');
        `}
      </style>

      <div className="w-full max-w-xl bg-white rounded-[3rem] overflow-hidden border border-gray-100 flex flex-col min-h-[650px] relative transition-all duration-500">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-50 flex">
          <div 
            className="h-full transition-all duration-700 ease-out" 
            style={{ 
              backgroundColor: primaryColor,
              width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
            }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-16 text-center w-full">
          {/* Logo Rendering */}
          {branding?.logoUrl && (
            <div className="mb-8 flex justify-center w-full animate-in fade-in duration-700">
              <img src={branding.logoUrl} alt="Logo" className="max-h-16 object-contain pointer-events-none" />
            </div>
          )}

          {/* Welcome Step */}
          {currentStep?.type === 'welcome' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-md">
                {currentStep.description}
              </p>
              <button 
                onClick={handleNext}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {(currentStep.config as Record<string, string | boolean>)?.buttonText || 'Start'} <ArrowRight size={22} />
              </button>
            </div>
          )}

          {/* Informative Step */}
          {currentStep?.type === 'informative' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-md">
                {currentStep.description}
              </p>
              <button 
                onClick={handleNext}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {(currentStep.config as Record<string, string | boolean>)?.buttonText || 'Continue'} <ArrowRight size={22} />
              </button>
            </div>
          )}

          {/* Rating Step */}
          {currentStep?.type === 'rating' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 mb-10 text-xl leading-relaxed">{currentStep.description}</p>
              
              <div className="flex gap-4 justify-center mb-12">
                {(currentStep.config as Record<string, string | boolean>)?.ratingType === 'emojis' ? (
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
                onClick={handleNext}
                style={{ backgroundColor: rating > 0 ? primaryColor : '#E5E7EB' }}
                className="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {(currentStep.config as Record<string, string | boolean>)?.buttonText || 'Continue'} <ArrowRight size={22} />
              </button>
            </div>
          )}

          {/* Textarea Step */}
          {currentStep?.type === 'textarea' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 mb-8 text-xl leading-relaxed">{currentStep.description}</p>
              
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={((currentStep.config as Record<string, string | boolean>)?.placeholder as string) || "Type your testimonial here..."}
                className="w-full h-48 p-8 rounded-[2rem] border-2 border-gray-100 bg-gray-50 mb-8 focus:ring-4 focus:ring-gray-100 focus:border-gray-200 outline-none transition-all text-black text-lg resize-none placeholder:text-gray-400"
              />

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-6 py-5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-all font-bold"
                >
                  <ArrowLeft size={22} />
                </button>
                <button 
                  disabled={content.length < 5}
                  onClick={handleNext}
                  style={{ backgroundColor: content.length >= 5 ? primaryColor : '#E5E7EB' }}
                  className="flex-1 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {(currentStep.config as Record<string, string | boolean>)?.buttonText || 'Next'} <ArrowRight size={22} />
                </button>
              </div>
            </div>
          )}

          {/* Attribution Step */}
          {currentStep?.type === 'attribution' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 mb-10 text-xl leading-relaxed">{currentStep.description}</p>
              
              <div className="w-full space-y-4 mb-10">
                <div className="flex flex-col gap-4">
                  <div className="w-full h-32 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 hover:border-gray-200 transition-all cursor-pointer group">
                    <Plus size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Add a photo</span>
                  </div>
                  
                  <input
                    required
                    type="text"
                    placeholder="Your full name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-8 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-lg text-black placeholder:text-gray-400"
                  />
                </div>

                {(currentStep.config as Record<string, string | boolean>)?.collectEmail !== false && (
                  <input
                    required
                    type="email"
                    placeholder="votre@email.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-8 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-lg text-black placeholder:text-gray-400"
                  />
                )}

                {(currentStep.config as Record<string, string | boolean>)?.collectCompany && (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Your company"
                      value={authorTitle}
                      onChange={(e) => setAuthorTitle(e.target.value)}
                      className="w-full px-8 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-lg text-black placeholder:text-gray-400"
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      value={authorUrl}
                      onChange={(e) => setAuthorUrl(e.target.value)}
                      className="w-full px-8 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-100 outline-none transition-all text-lg text-black placeholder:text-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 w-full">
                 <button 
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-6 py-5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-all font-bold"
                >
                  <ArrowLeft size={22} />
                </button>
                <button 
                  disabled={!authorName || submitting}
                  onClick={handleNext}
                  style={{ backgroundColor: authorName ? primaryColor : '#E5E7EB' }}
                  className="flex-1 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 size={28} className="animate-spin" /> : (currentStep.config as Record<string, string | boolean>)?.buttonText || 'Finish'}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep?.type === 'success' && (
            <div className="animate-in zoom-in-95 duration-1000 w-full flex flex-col items-center">
              <div 
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner animate-bounce"
              >
                <CheckCircle size={64} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: headingFont, color: '#000000' }}>
                {currentStep.title}
              </h1>
              <p className="text-gray-600 text-xl leading-relaxed max-w-md">
                {currentStep.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
