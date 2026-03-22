import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'

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
  showPoweredBy: boolean
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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/v1/public/forms/${slug}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Formulaire non trouvé')
        }
        const data = await res.json()
        // Filter enabled steps
        data.config.steps = data.config.steps.filter((s: FormStep) => s.isEnabled)
        setForm(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [slug])

  const steps = form?.config?.steps || []
  const currentStep = steps[currentStepIndex]
  const primaryColor = form?.config?.branding?.primaryColor || '#0D9E75'

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
          rating
        })
      })
      if (res.ok) {
        setCurrentStepIndex(steps.length - 1) // Go to success step (last one)
      } else {
        const data = await res.json()
        alert(data.error || "Une erreur est survenue lors de l'envoi.")
      }
    } catch (error) {
      console.error("Submission failed", error)
      alert("Erreur réseau. Veuillez réessayer.")
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
      <p className="text-gray-500">{error || 'Le formulaire est introuvable.'}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-xl bg-white shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-50 flex">
          <div 
            className="h-full transition-all duration-500" 
            style={{ 
              backgroundColor: primaryColor,
              width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
            }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          {currentStep?.type === 'rating' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              <h1 className="text-xl font-black tracking-tight text-gray-900 mb-4">{currentStep.title}</h1>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed">{currentStep.description}</p>
              
              <div className="flex gap-2 justify-center mb-12">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRating(val)}
                    onDoubleClick={() => {setRating(val); handleNext();}}
                    className="p-1 transition-all hover:scale-110 group focus:outline-none"
                  >
                    <Star 
                      size={48} 
                      className={`transition-all ${rating >= val ? 'fill-yellow-400 text-yellow-400 shadow-yellow-200' : 'text-gray-200 group-hover:text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>

              <button 
                disabled={rating === 0}
                onClick={handleNext}
                style={{ backgroundColor: rating > 0 ? primaryColor : '#E5E7EB' }}
                className="w-full py-3 rounded-xl text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-100 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight size={18} />
              </button>
            </div>
          )}

          {currentStep?.type === 'textarea' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              <h1 className="text-xl font-black tracking-tight text-gray-900 mb-4">{currentStep.title}</h1>
              <p className="text-gray-500 mb-8 text-lg">{currentStep.description}</p>
              
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: J'adore cet outil, il a changé ma façon de travailler..."
                className="w-full h-40 p-6 rounded-2xl border border-gray-200 bg-gray-50 mb-8 focus:ring-4 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all text-gray-700 text-lg resize-none"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all font-bold"
                >
                  <ArrowLeft size={18} />
                </button>
                <button 
                  disabled={content.length < 5}
                  onClick={handleNext}
                  style={{ backgroundColor: content.length >= 5 ? primaryColor : '#E5E7EB' }}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Suivant <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {currentStep?.type === 'attribution' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
              <h1 className="text-xl font-black tracking-tight text-gray-900 mb-4">{currentStep.title}</h1>
              <p className="text-gray-500 mb-10 text-lg">{currentStep.description}</p>
              
              <div className="space-y-4 mb-10">
                <input
                  required
                  type="text"
                  placeholder="Votre nom complet"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-gray-100 outline-none transition-all text-lg"
                />
                <input
                  required
                  type="email"
                  placeholder="votre@email.com"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-gray-100 outline-none transition-all text-lg"
                />
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all font-bold"
                >
                  <ArrowLeft size={18} />
                </button>
                <button 
                  disabled={!authorName || !authorEmail || submitting}
                  onClick={handleNext}
                  style={{ backgroundColor: (authorName && authorEmail) ? primaryColor : '#E5E7EB' }}
                  className="flex-1 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : 'Terminer'}
                </button>
              </div>
            </div>
          )}

          {currentStep?.type === 'success' && (
            <div className="animate-in zoom-in duration-700 w-full">
              <div 
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
              >
                <CheckCircle size={56} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">{currentStep.title}</h1>
              <p className="text-gray-500 text-lg leading-relaxed">{currentStep.description}</p>
            </div>
          )}
        </div>

        {form.config.branding.showPoweredBy && (
          <div className="p-8 flex justify-center opacity-30">
             <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
               <span style={{ color: primaryColor }}>❤</span> Powered by Reviewskits
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
