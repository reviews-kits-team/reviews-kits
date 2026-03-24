import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Save,
  Settings,
  Layout,
  Plus,
  Star,
  CheckCircle,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  Trash2,
  Upload,
  Link,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'
import { ColorPicker } from '../components/ui/color-picker'

// Types
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
  brandColors?: string[]
}

interface FormData {
  id: string
  publicId: string
  name: string
  config: {
    steps: FormStep[]
    branding: FormBranding
  }
}

export default function FormEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pages' | 'design'>('pages')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showSharePopover, setShowSharePopover] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const sidebarRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({})

  const handleElementClick = (elementKey: string, stepId: string) => {
    setActiveStepId(stepId)
    setSelectedElement(elementKey)
    scrollToStep(stepId)

    // Focus the sidebar input
    setTimeout(() => {
      const input = sidebarRefs.current[elementKey]
      if (input) {
        input.focus()
        input.select()
      }
    }, 100)
  }

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/v1/forms/${id}`)
        if (res.ok) {
          const data = await res.json()
          setForm(data)
          if (data.config?.steps?.length > 0) {
            setActiveStepId(data.config.steps[0].id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch form", error)
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [id])

  // Intersection Observer to sync activeStepId with scroll
  useEffect(() => {
    if (!form) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const stepId = entry.target.getAttribute('data-step-id')
            if (stepId) setActiveStepId(stepId)
          }
        })
      },
      {
        root: canvasRef.current,
        threshold: 0.6,
      }
    )

    const currentRefs = stepRefs.current
    Object.values(currentRefs).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      Object.values(currentRefs).forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [form, loading])

  const scrollToStep = (stepId: string) => {
    const element = stepRefs.current[stepId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!form) return
    const newSteps = [...form.config.steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newSteps.length) return

    // Swap
    const temp = newSteps[index]
    newSteps[index] = newSteps[targetIndex]
    newSteps[targetIndex] = temp

    setForm({ ...form, config: { ...form.config, steps: newSteps } })

    // Scroll to the moved step
    setTimeout(() => scrollToStep(temp.id), 100)
  }
  const updateStep = (stepId: string, updates: Partial<FormStep>) => {
    if (!form) return
    const newSteps = [...form.config.steps]
    const stepIdx = newSteps.findIndex(s => s.id === stepId)
    if (stepIdx === -1) return

    newSteps[stepIdx] = { ...newSteps[stepIdx], ...updates }
    setForm({ ...form, config: { ...form.config, steps: newSteps } })
  }
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && form) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm({
          ...form,
          config: {
            ...form.config,
            branding: { ...form.config.branding, logoUrl: reader.result as string }
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    if (form) {
      setForm({
        ...form,
        config: {
          ...form.config,
          branding: { ...form.config.branding, logoUrl: undefined }
        }
      })
    }
  }


  const handleCopyLink = () => {
    const url = `${window.location.origin}/f/${form?.publicId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!form) return
    try {
      const res = await fetch(`/api/v1/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          config: form.config
        })
      })
      if (res.ok) {
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save form", error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  if (!form) return <div className="flex items-center justify-center h-screen text-white">Form not found</div>

  const activeStep = form.config.steps.find(s => s.id === activeStepId)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <TopBar />

      <main className="max-w-[1140px] mx-auto px-6 py-8 pb-20 relative z-10">
        {/* Editor Title & Actions */}
        <div className="mb-8 flex items-center justify-between gap-6 py-2">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex-1 max-w-md">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--v3-teal)] block opacity-60">
                Editor
              </span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-base font-bold tracking-tight text-[var(--v3-text)] focus:ring-0 outline-none placeholder:opacity-20"
                placeholder="Form name..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                <Monitor size={16} />
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSharePopover(!showSharePopover)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10"
              >
                <Link size={14} />
                Share
              </button>

              {showSharePopover && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl p-4 z-[300] animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Public Link</span>
                      <button onClick={() => setShowSharePopover(false)} className="text-white/20 hover:text-white">
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2 overflow-hidden">
                      <span className="text-[10px] text-white/40 truncate flex-1">
                        {`${window.location.origin}/f/${form.publicId}`}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-[#0D9E75] text-white' : 'hover:bg-white/10 text-white/40'}`}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                    <a
                      href={`/f/${form.publicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#0D9E75] hover:underline flex items-center gap-1 mt-1"
                    >
                      Open link <ArrowRight size={10} />
                    </a>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0D9E75] hover:bg-[#0BA87E] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#0D9E75]/20"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <section
            ref={canvasRef}
            className="order-last lg:order-first w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl lg:rounded-3xl shadow-2xl h-[60vh] lg:h-[calc(100vh-140px)] overflow-y-auto p-4 md:p-8 lg:p-12 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed custom-scrollbar snap-y snap-mandatory"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>
              {`
                section::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {/* Fixed Minimalist Reorder Buttons (Top-Right of Canvas) */}
            <div className="sticky top-0 right-0 z-50 flex justify-end p-0 pointer-events-none">
              <div className="flex gap-1 bg-[#0A0A0A]/60 backdrop-blur-md p-1 rounded-bl-xl border-l border-b border-white/10 pointer-events-auto shadow-2xl overflow-hidden">
                <button
                  disabled={form.config.steps.findIndex(s => s.id === activeStepId) <= 0}
                  onClick={() => moveStep(form.config.steps.findIndex(s => s.id === activeStepId), 'up')}
                  className="p-2 text-[#0D9E75] hover:bg-[#0D9E75]/10 rounded-lg transition-all disabled:opacity-20"
                  title="Move current step up"
                >
                  <ChevronUp size={16} strokeWidth={3} />
                </button>
                <button
                  disabled={form.config.steps.findIndex(s => s.id === activeStepId) >= form.config.steps.length - 1}
                  onClick={() => moveStep(form.config.steps.findIndex(s => s.id === activeStepId), 'down')}
                  className="p-2 text-[#0D9E75] hover:bg-[#0D9E75]/10 rounded-lg transition-all disabled:opacity-20"
                  title="Move current step down"
                >
                  <ChevronDown size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              {form.config.steps.map((step, index) => (
                <div
                  key={step.id}
                  ref={el => { stepRefs.current[step.id] = el }}
                  data-step-id={step.id}
                  className="flex flex-col items-center w-full min-h-[500px] md:min-h-[1100px] snap-center justify-center py-10 md:py-20 relative"
                >
                  {/* Step Card Container */}
                  <div
                    onClick={() => scrollToStep(step.id)}
                    className={`
                      transition-all duration-500 shadow-2xl relative bg-white overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer
                      ${previewMode === 'mobile' ? 'w-full max-w-[375px] h-[75vh] md:h-[812px]' : 'w-full max-w-[800px] h-[75vh] md:h-[920px]'}
                      ${activeStepId === step.id ? 'ring-4 ring-[#0D9E75] ring-offset-4 ring-offset-[#0A0A0A]' : 'opacity-40 hover:opacity-100 hover:ring-2 hover:ring-white/20 scale-95 lg:scale-95'}
                      ${!step.isEnabled ? 'grayscale-[1]' : ''}
                    `}
                  >
                    {/* Step Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                        Step {index + 1}: {step.type}
                      </div>
                    </div>

                    {/* Preview Content */}
                    {(() => {
                      const branding = form.config.branding;
                      const primaryColor = branding.primaryColor || '#0D9E75';
                      const headingFont = branding.headingFont || 'Inter';
                      const bodyFont = branding.bodyFont || 'Inter';

                      // Helper to get Google Font URL
                      const getFontUrl = (font: string) => `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700;900&display=swap`;

                      return (
                        <div
                          className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 text-[#1a1a1a] gap-y-4 md:gap-y-6 relative overflow-y-auto"
                          style={{ fontFamily: bodyFont }}
                        >
                          {/* Dynamic Font Loading */}
                          <style>
                            {`
                              @import url('${getFontUrl(headingFont)}');
                              @import url('${getFontUrl(bodyFont)}');
                            `}
                          </style>

                          {branding.logoUrl && (
                            <div className="mb-4 flex justify-center w-full">
                              <img
                                src={branding.logoUrl}
                                alt="Logo"
                                className="max-h-16 w-auto object-contain"
                              />
                            </div>
                          )}
                          {(step.type === 'welcome' || step.type === 'informative') && (
                            <div className="flex flex-col items-center gap-y-6 text-center w-full">
                              <h2
                                onClick={() => handleElementClick('title', step.id)}
                                style={{
                                  borderColor: selectedElement === 'title' && activeStepId === step.id ? '#000000' : 'transparent',
                                  fontFamily: headingFont,
                                  color: '#000000'
                                }}
                                className={`text-black text-2xl md:text-4xl font-black tracking-tighter cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'title' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.title}
                              </h2>
                              <p
                                onClick={() => handleElementClick('description', step.id)}
                                style={{ borderColor: selectedElement === 'description' && activeStepId === step.id ? '#000000' : 'transparent' }}
                                className={`text-gray-600 cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'description' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.description}
                              </p>
                              <button
                                onClick={() => handleElementClick('buttonText', step.id)}
                                style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
                                className={`text-white w-full py-4 rounded-xl text-xs font-bold shadow-xl transition-all border-2 ${selectedElement === 'buttonText' && activeStepId === step.id ? 'border-dashed border-white ring-4 ring-black/10' : 'border-transparent'}`}
                              >
                                {(step.config as Record<string, string | boolean>)?.buttonText || 'Continue'}
                              </button>
                            </div>
                          )}

                          {step.type === 'rating' && (
                            <div className="flex flex-col items-center gap-y-6 text-center w-full">
                              <h2
                                onClick={() => handleElementClick('title', step.id)}
                                style={{
                                  borderColor: selectedElement === 'title' && activeStepId === step.id ? '#000000' : 'transparent',
                                  fontFamily: headingFont,
                                  color: '#000000'
                                }}
                                className={`text-black text-2xl md:text-4xl font-black tracking-tighter text-balance cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'title' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.title}
                              </h2>
                              <p
                                onClick={() => handleElementClick('description', step.id)}
                                style={{ borderColor: selectedElement === 'description' && activeStepId === step.id ? '#000000' : 'transparent' }}
                                className={`text-gray-600 cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'description' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.description}
                              </p>
                              <div className="flex gap-8 justify-center">
                                {(step.config as Record<string, string | boolean>)?.ratingType === 'emojis' ? (
                                  ['😠', '🙁', '😐', '🙂', '😍'].map((emoji, i) => (
                                    <div key={i} className="text-4xl filter grayscale hover:grayscale-0 transition-all cursor-default">
                                      {emoji}
                                    </div>
                                  ))
                                ) : (
                                  [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-2">
                                      <Star size={previewMode === 'mobile' ? 30 : 40} className="text-gray-300 fill-gray-200" />
                                    </div>
                                  ))
                                )}
                              </div>
                              <button
                                onClick={() => handleElementClick('buttonText', step.id)}
                                style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
                                className={`text-white w-full py-4 rounded-xl text-xs font-bold shadow-xl transition-all border-2 ${selectedElement === 'buttonText' && activeStepId === step.id ? 'border-dashed border-white ring-4 ring-black/10' : 'border-transparent'}`}
                              >
                                {(step.config as Record<string, string | boolean>)?.buttonText || 'Continuer'}
                              </button>
                            </div>
                          )}

                          {step.type === 'textarea' && (
                            <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
                              <h2
                                onClick={() => handleElementClick('title', step.id)}
                                style={{ borderColor: selectedElement === 'title' && activeStepId === step.id ? '#000000' : 'transparent', fontFamily: headingFont, color: '#000000' }}
                                className={`text-2xl md:text-3xl font-black tracking-tighter cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'title' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.title}
                              </h2>
                              <p
                                onClick={() => handleElementClick('description', step.id)}
                                style={{ borderColor: selectedElement === 'description' && activeStepId === step.id ? '#000000' : 'transparent' }}
                                className={`text-gray-600 cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'description' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.description}
                              </p>
                              <textarea
                                disabled
                                onClick={() => handleElementClick('placeholder', step.id)}
                                className={`w-full h-48 p-6 rounded-2xl border-2 bg-gray-50 outline-none transition-all placeholder:text-gray-400 italic cursor-pointer ${selectedElement === 'placeholder' && activeStepId === step.id ? 'border-dashed border-gray-100' : 'border-gray-100 hover:border-black/5'}`}
                                style={{ borderColor: selectedElement === 'placeholder' && activeStepId === step.id ? '#000000' : undefined }}
                                placeholder={((step.config as Record<string, string | boolean>)?.placeholder as string) || "Type your testimonial here..."}
                              />
                              <button
                                onClick={() => handleElementClick('buttonText', step.id)}
                                style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
                                className={`text-white w-full py-4 rounded-xl text-xs font-bold shadow-xl transition-all border-2 ${selectedElement === 'buttonText' && activeStepId === step.id ? 'border-dashed border-white ring-4 ring-black/10' : 'border-transparent'}`}
                              >
                                {(step.config as Record<string, string | boolean>)?.buttonText || 'Next'}
                              </button>
                            </div>
                          )}

                          {step.type === 'attribution' && (
                            <div className="w-full max-w-md flex flex-col items-center gap-y-6 text-center">
                              <h2
                                onClick={() => handleElementClick('title', step.id)}
                                style={{ borderColor: selectedElement === 'title' && activeStepId === step.id ? '#000000' : 'transparent', fontFamily: headingFont, color: '#000000' }}
                                className={`text-2xl md:text-3xl font-black tracking-tighter cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'title' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.title}
                              </h2>
                              <p
                                onClick={() => handleElementClick('description', step.id)}
                                style={{ borderColor: selectedElement === 'description' && activeStepId === step.id ? '#000000' : 'transparent' }}
                                className={`text-gray-600 cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'description' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.description}
                              </p>
                              <div className="w-full space-y-4">
                                <div className="flex flex-col gap-4">
                                  <div className="w-full h-32 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-100 mb-2">
                                    <Plus size={24} />
                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider">Add a photo</span>
                                  </div>
                                  <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center text-gray-600 text-xs text-left italic">
                                    {(step.config as Record<string, string | boolean>)?.collectName !== false ? 'Your name' : 'Anonymous'}
                                  </div>
                                </div>
                                {(step.config as Record<string, string | boolean>)?.collectEmail !== false && (
                                  <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">votre@email.com</div>
                                )}
                                {(step.config as Record<string, string | boolean>)?.collectCompany && (
                                  <div className="w-full px-4 py-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 text-xs text-left italic">Your company / website</div>
                                )}
                              </div>
                              <button
                                onClick={() => handleElementClick('buttonText', step.id)}
                                style={{ backgroundColor: primaryColor, fontFamily: bodyFont }}
                                className={`text-white w-full py-4 rounded-xl text-xs font-bold shadow-xl transition-all border-2 ${selectedElement === 'buttonText' && activeStepId === step.id ? 'border-dashed border-white ring-4 ring-black/10' : 'border-transparent'}`}
                              >
                                {(step.config as Record<string, string | boolean>)?.buttonText || 'Finish'}
                              </button>
                            </div>
                          )}

                          {step.type === 'success' && (
                            <div className="flex flex-col items-center gap-y-6 text-center w-full">
                              <div
                                className="w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500 shadow-lg"
                                style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}
                              >
                                <CheckCircle size={40} />
                              </div>
                              <h2
                                onClick={() => handleElementClick('title', step.id)}
                                style={{ borderColor: selectedElement === 'title' && activeStepId === step.id ? '#000000' : 'transparent', fontFamily: headingFont, color: '#000000' }}
                                className={`text-2xl md:text-3xl font-black tracking-tighter cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'title' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.title}
                              </h2>
                              <p
                                onClick={() => handleElementClick('description', step.id)}
                                style={{ borderColor: selectedElement === 'description' && activeStepId === step.id ? '#000000' : 'transparent' }}
                                className={`text-gray-600 cursor-pointer transition-all rounded-lg p-1 border-2 ${selectedElement === 'description' && activeStepId === step.id ? 'border-dashed' : 'border-transparent hover:border-black/5'}`}
                              >
                                {step.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Flow Arrow - Adjusted for snap spacing */}
                  {index < form.config.steps.length - 1 && (
                    <div className="h-20 flex items-center justify-center text-white/20 animate-bounce mt-10">
                      <ChevronDown size={32} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}

              {/* Add Step Button */}
              <div className="h-[400px] flex items-center justify-center snap-center w-full">
                <button
                  className="flex flex-col items-center gap-4 group"
                  onClick={() => {
                    const newId = `step_${Date.now()}`
                    const newStep: FormStep = {
                      id: newId,
                      type: 'textarea',
                      title: 'New step',
                      description: 'Description of the new step',
                      isEnabled: true
                    }
                    setForm({ ...form, config: { ...form.config, steps: [...form.config.steps, newStep] } })
                    // Wait for render then scroll
                    setTimeout(() => scrollToStep(newId), 100)
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center group-hover:bg-[#0D9E75]/10 group-hover:border-[#0D9E75] transition-all">
                    <Plus size={24} className="text-white/40 group-hover:text-[#0D9E75]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60">Add a step</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Sidebar: Settings */}
          <aside className="order-first lg:order-last w-full lg:w-auto bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl lg:rounded-3xl flex flex-col overflow-hidden lg:sticky top-8 h-[45vh] lg:h-[calc(100vh-140px)] z-40 shadow-2xl">
            <div className="flex border-b border-white/5 p-1 bg-white/5 shrink-0">
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pages' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'}`}
              >
                <Layout size={14} className="inline mr-2" />
                Step
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'}`}
              >
                <Settings size={14} className="inline mr-2" />
                Design
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  {/* Selected Step Info */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D9E75] block mb-1">
                      Currently editing
                    </span>
                    <h3 className="text-sm font-bold truncate">
                      {activeStep ? activeStep.title : "No step selected"}
                    </h3>
                    <p className="text-[10px] text-white/40 mt-1 italic">
                      Click on a step in the canvas to edit it.
                    </p>
                  </div>

                  <div className="h-px bg-white/5" />

                  {activeStep && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] mb-3 block">Step title</label>
                        <input
                          ref={(el) => { sidebarRefs.current['title'] = el }}
                          type="text"
                          value={activeStep.title}
                          onChange={(e) => updateStep(activeStep.id, { title: e.target.value })}
                          className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--v3-teal)]/50 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] mb-3 block text-balance">Step description</label>
                        <textarea
                          ref={(el) => { sidebarRefs.current['description'] = el }}
                          value={activeStep.description}
                          onChange={(e) => updateStep(activeStep.id, { description: e.target.value })}
                          className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--v3-teal)]/50 transition-all outline-none min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0D9E75] block mb-4">Specific settings</span>

                        {activeStep.type === 'rating' && (
                          <div className="pt-6 border-t border-white/5 mt-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] mb-3 block">Rating style</label>
                            <div className="flex gap-2 bg-[var(--v3-bg)] p-1 rounded-xl border border-[var(--v3-border)]">
                              <button
                                onClick={() => updateStep(activeStep.id, { config: { ...activeStep.config, ratingType: 'stars' } })}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${((activeStep.config as Record<string, string | boolean>)?.ratingType || 'stars') === 'stars' ? 'bg-[var(--v3-teal)] text-white shadow-lg' : 'text-[var(--v3-muted2)] hover:text-white hover:bg-white/5'}`}
                              >
                                Stars
                              </button>
                              <button
                                onClick={() => updateStep(activeStep.id, { config: { ...activeStep.config, ratingType: 'emojis' } })}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${((activeStep.config as Record<string, string | boolean>)?.ratingType) === 'emojis' ? 'bg-[var(--v3-teal)] text-white shadow-lg' : 'text-[var(--v3-muted2)] hover:text-white hover:bg-white/5'}`}
                              >
                                Emojis
                              </button>
                            </div>
                          </div>
                        )}

                        {(activeStep.type === 'welcome' || activeStep.type === 'success' || activeStep.type === 'informative' || activeStep.type === 'rating' || activeStep.type === 'textarea' || activeStep.type === 'attribution') && (
                          <div className="pt-6 border-t border-white/5 mt-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] mb-3 block">Button text</label>
                            <input
                              ref={(el) => { sidebarRefs.current['buttonText'] = el }}
                              type="text"
                              value={((activeStep.config as Record<string, string | boolean>)?.buttonText as string) || ''}
                              onChange={(e) => updateStep(activeStep.id, { config: { ...activeStep.config, buttonText: e.target.value } })}
                              placeholder="Continue"
                              className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--v3-teal)]/50 transition-all outline-none"
                            />
                          </div>
                        )}

                        {activeStep.type === 'textarea' && (
                          <div className="pt-6 border-t border-white/5 mt-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--v3-muted2)] mb-3 block">Help text (Placeholder)</label>
                            <input
                              ref={(el) => { sidebarRefs.current['placeholder'] = el }}
                              type="text"
                              value={((activeStep.config as Record<string, string | boolean>)?.placeholder as string) || ''}
                              onChange={(e) => updateStep(activeStep.id, { config: { ...activeStep.config, placeholder: e.target.value } })}
                              placeholder="Type your testimonial here..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#0D9E75]/50 outline-none transition-all"
                            />
                          </div>
                        )}

                        {activeStep.type === 'attribution' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold">Collect email</span>
                              <button
                                onClick={() => {
                                  const newSteps = [...form.config.steps]
                                  const stepIdx = newSteps.findIndex(s => s.id === activeStepId)
                                  newSteps[stepIdx].config = { ...newSteps[stepIdx].config, collectEmail: !(newSteps[stepIdx].config as Record<string, string | boolean>)?.collectEmail }
                                  setForm({ ...form, config: { ...form.config, steps: newSteps } })
                                }}
                                className={`w-10 h-5 rounded-full transition-all relative ${(activeStep.config as Record<string, string | boolean>)?.collectEmail !== false ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${(activeStep.config as Record<string, string | boolean>)?.collectEmail !== false ? 'left-6' : 'left-1'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold">Collect company</span>
                              <button
                                onClick={() => {
                                  const newSteps = [...form.config.steps]
                                  const stepIdx = newSteps.findIndex(s => s.id === activeStepId)
                                  newSteps[stepIdx].config = { ...newSteps[stepIdx].config, collectCompany: !(newSteps[stepIdx].config as Record<string, string | boolean>)?.collectCompany }
                                  setForm({ ...form, config: { ...form.config, steps: newSteps } })
                                }}
                                className={`w-10 h-5 rounded-full transition-all relative ${(activeStep.config as Record<string, string | boolean>)?.collectCompany ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${(activeStep.config as Record<string, string | boolean>)?.collectCompany ? 'left-6' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Enable this step</span>
                          <button
                            onClick={() => {
                              const newSteps = [...form.config.steps]
                              const stepIdx = newSteps.findIndex(s => s.id === activeStepId)
                              newSteps[stepIdx].isEnabled = !newSteps[stepIdx].isEnabled
                              setForm({ ...form, config: { ...form.config, steps: newSteps } })
                            }}
                            className={`w-10 h-5 rounded-full transition-all relative ${activeStep.isEnabled ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeStep.isEnabled ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Couleur primaire</label>
                    <div className="flex items-center gap-3">
                      <ColorPicker
                        value={form.config.branding.primaryColor || '#0D9E75'}
                        onChange={(color) => setForm({
                          ...form,
                          config: {
                            ...form.config,
                            branding: { ...form.config.branding, primaryColor: color }
                          }
                        })}
                        brandColors={form.config.branding.brandColors}
                        onAddBrandColor={(color) => {
                          const currentBrandColors = form.config.branding.brandColors || ['#D6C750', '#0D1E3D', '#F2F4F7'];
                          if (!currentBrandColors.includes(color)) {
                            setForm({
                              ...form,
                              config: {
                                ...form.config,
                                branding: {
                                  ...form.config.branding,
                                  brandColors: [...currentBrandColors, color]
                                }
                              }
                            });
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div className="pt-6 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Logo de la marque</label>
                    <div className="space-y-4">
                      {form.config.branding.logoUrl ? (
                        <div className="relative group">
                          <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-6">
                            <img src={form.config.branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                          <button
                            onClick={removeLogo}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#0D9E75]/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[#0D9E75] group-hover:bg-[#0D9E75]/10 transition-all">
                            <Upload size={18} />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold block">Upload logo</span>
                            <span className="text-[10px] text-white/20">PNG, JPG up to 2MB</span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Typography Section */}
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Police des Titres (Headings)</label>
                      <select
                        value={form.config.branding.headingFont || 'Inter'}
                        onChange={(e) => setForm({
                          ...form,
                          config: {
                            ...form.config,
                            branding: { ...form.config.branding, headingFont: e.target.value }
                          }
                        })}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#0D9E75]/50 outline-none transition-all cursor-pointer"
                      >
                        {['Inter', 'Montserrat', 'Playfair Display', 'Poppins', 'Roboto', 'Syne', 'Outfit'].map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Police du Corps (Body)</label>
                      <select
                        value={form.config.branding.bodyFont || 'Inter'}
                        onChange={(e) => setForm({
                          ...form,
                          config: {
                            ...form.config,
                            branding: { ...form.config.branding, bodyFont: e.target.value }
                          }
                        })}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#0D9E75]/50 outline-none transition-all cursor-pointer"
                      >
                        {['Inter', 'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Work Sans'].map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Toast Notification */}
      {showSaveSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0D9E75] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-[9999]">
          <CheckCircle size={20} className="text-white" />
          <span className="font-bold text-sm">Changes saved!</span>
        </div>
      )}
    </div>
  )
}
