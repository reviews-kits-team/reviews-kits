import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { FormData, FormStep, StepField } from './public-form/types'

// Step Components
import { WelcomeStep } from './public-form/steps/WelcomeStep'
import { InformativeStep } from './public-form/steps/InformativeStep'
import { RatingStep } from './public-form/steps/RatingStep'
import { TextareaStep } from './public-form/steps/TextareaStep'
import { AttributionStep } from './public-form/steps/AttributionStep'
import { IdentityStep } from './public-form/steps/IdentityStep'
import { CoreStep } from './public-form/steps/CoreStep'
import { CustomStep } from './public-form/steps/CustomStep'
import { SuccessStep } from './public-form/steps/SuccessStep'
import { ConsentStep } from './public-form/steps/ConsentStep'

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
  const [consentPublic, setConsentPublic] = useState(false)
  const [consentInternal, setConsentInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // Selection state for custom step fields (fieldId → selected value)
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({})

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
  const [fontsReady, setFontsReady] = useState(false)

  const getFontUrl = (font: string) => `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700;900&display=swap`

  // Load fonts and apply only once ready to prevent FOUT
  useEffect(() => {
    let cancelled = false
    const fonts = [headingFont, bodyFont]
    const links: HTMLLinkElement[] = []

    fonts.forEach(font => {
      const id = `font-${font.replace(/ /g, '-')}`
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        link.href = getFontUrl(font)
        document.head.appendChild(link)
        links.push(link)
      }
    })

    Promise.all(fonts.map(f => document.fonts.load(`700 1em "${f}"`))).then(() => {
      if (!cancelled) setFontsReady(true)
    })

    return () => {
      cancelled = true
      links.forEach(link => {
        if (link.parentNode) document.head.removeChild(link)
      })
      setFontsReady(false)
    }
  }, [headingFont, bodyFont])

  const appliedHeadingFont = fontsReady ? headingFont : 'system-ui, sans-serif'
  const appliedBodyFont = fontsReady ? bodyFont : 'system-ui, sans-serif'

  const handleNext = async () => {
    if (currentStep?.type === 'consent' || currentStep?.type === 'identity' || currentStep?.type === 'attribution') {
      // If there is a consent step, the submit action happens on the consent step.
      // But identity/attribution can also be the last step (submitting) if no consent step is placed after them (backward compatibility). 
      // Based on the new design, Consent is the final step. Wait, the problem is identity/attribution have a submit action.
      // Let's check if it is the last step (or if a consent step follows).
      const isLastPreSubmitStep = !steps.slice(currentStepIndex + 1).some(s => s.type === 'consent' || s.type === 'identity' || s.type === 'attribution');
      
      if (currentStep?.type === 'consent' || isLastPreSubmitStep) {
        await handleSubmit()
      } else {
        setCurrentStepIndex(prev => prev + 1)
      }
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!form) return
    setSubmitting(true)
    try {
      // Build metadata from custom step field answers
      const metadata: Record<string, unknown> = {}
      steps.forEach(step => {
        if (step.type === 'custom') {
          const fields = ((step.config as Record<string, unknown>)?.fields || []) as StepField[]
          fields.forEach(field => {
            const val = customFieldValues[field.id]
            if (val === undefined) return
            if (field.type === 'grid') {
              // Map row indices to row labels
              const rowMap = val as Record<number, string>
              const labeled: Record<string, string> = {}
              ;(field.rows || []).forEach((row, ri) => {
                if (rowMap[ri] !== undefined) labeled[row] = rowMap[ri]
              })
              metadata[field.label] = labeled
            } else {
              metadata[field.label] = val
            }
          })
        }
      })

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
          rating,
          consentPublic,
          consentInternal,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined
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
        alert(typeof data.error === 'string' ? data.error : "An error occurred while sending.")
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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6" style={{ fontFamily: appliedBodyFont }}>
      <div className="w-full max-w-xl bg-white rounded-[3rem] overflow-hidden border border-gray-100 flex flex-col min-h-162.5 relative transition-all duration-500">
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

          {/* Step Rendering */}
          {currentStep?.type === 'welcome' && (
            <WelcomeStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              onNext={handleNext} 
            />
          )}

          {currentStep?.type === 'informative' && (
            <InformativeStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              onNext={handleNext} 
            />
          )}

          {currentStep?.type === 'rating' && (
            <RatingStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              rating={rating} 
              setRating={setRating} 
              onNext={handleNext} 
            />
          )}

          {currentStep?.type === 'textarea' && (
            <TextareaStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              content={content} 
              setContent={setContent} 
              onNext={handleNext} 
              onBack={() => setCurrentStepIndex(prev => prev - 1)} 
            />
          )}

          {currentStep?.type === 'attribution' && (
            <AttributionStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              authorName={authorName} 
              setAuthorName={setAuthorName} 
              authorEmail={authorEmail} 
              setAuthorEmail={setAuthorEmail} 
              authorTitle={authorTitle} 
              setAuthorTitle={setAuthorTitle} 
              authorUrl={authorUrl} 
              setAuthorUrl={setAuthorUrl} 
              submitting={submitting && (currentStepIndex === steps.length - 1 || steps[currentStepIndex + 1]?.type === 'success')} 
              onNext={handleNext} 
              onBack={() => setCurrentStepIndex(prev => prev - 1)} 
            />
          )}

          {currentStep?.type === 'consent' && (
            <ConsentStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              consentPublic={consentPublic} 
              setConsentPublic={setConsentPublic}
              consentInternal={consentInternal}
              setConsentInternal={setConsentInternal}
              submitting={submitting} 
              onNext={handleNext} 
              onBack={() => setCurrentStepIndex(prev => prev - 1)} 
            />
          )}

          {currentStep?.type === 'core' && (
            <CoreStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              rating={rating} 
              setRating={setRating} 
              content={content} 
              setContent={setContent} 
              onNext={handleNext} 
            />
          )}

          {currentStep?.type === 'identity' && (
            <IdentityStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              authorName={authorName} 
              setAuthorName={setAuthorName} 
              authorEmail={authorEmail} 
              setAuthorEmail={setAuthorEmail} 
              authorTitle={authorTitle} 
              setAuthorTitle={setAuthorTitle} 
              authorUrl={authorUrl} 
              setAuthorUrl={setAuthorUrl} 
              submitting={submitting && (currentStepIndex === steps.length - 1 || steps[currentStepIndex + 1]?.type === 'success')} 
              onNext={handleNext} 
              onBack={() => setCurrentStepIndex(prev => prev - 1)} 
            />
          )}

          {currentStep?.type === 'custom' && (
            <CustomStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
              customFieldValues={customFieldValues} 
              setCustomFieldValues={setCustomFieldValues} 
              onNext={handleNext} 
              onBack={() => setCurrentStepIndex(prev => prev - 1)} 
            />
          )}

          {currentStep?.type === 'success' && (
            <SuccessStep 
              step={currentStep} 
              primaryColor={primaryColor} 
              appliedHeadingFont={appliedHeadingFont} 
            />
          )}
        </div>
      </div>
    </div>
  )
}
