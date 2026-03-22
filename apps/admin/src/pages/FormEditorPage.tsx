import { useState, useEffect } from 'react'
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
  ChevronDown
} from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'

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
  showPoweredBy: boolean
}

interface FormData {
  id: string
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

  const handleSave = async () => {
    if (!form) return
    try {
      const res = await fetch(`/api/v1/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: form.config
        })
      })
      if (res.ok) {
        alert("Modifications enregistrées !")
      }
    } catch (error) {
      console.error("Failed to save form", error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Chargement...</div>
  if (!form) return <div className="flex items-center justify-center h-screen text-white">Formulaire non trouvé</div>

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
                Éditeur
              </span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-base font-bold tracking-tight text-[var(--v3-text)] focus:ring-0 outline-none placeholder:opacity-20"
                placeholder="Nom du formulaire..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
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
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0D9E75] hover:bg-[#0BA87E] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#0D9E75]/20"
            >
              <Save size={14} />
              Enregistrer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Real-time Preview */}
          <section className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-3xl overflow-hidden shadow-2xl min-h-[600px] flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
            <div className={`transition-all duration-500 shadow-2xl relative bg-white overflow-hidden rounded-3xl ${previewMode === 'mobile' ? 'w-[320px] h-[568px] scale-[0.9]' : 'w-full max-w-[600px] aspect-[16/10]'}`}>
              {/* Preview Content */}
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-[#1a1a1a]">
                {activeStep?.type === 'rating' && (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-black tracking-tighter mb-4 text-balance">{activeStep.title}</h2>
                    <p className="text-gray-500 mb-8">{activeStep.description}</p>
                    <div className="flex gap-2 justify-center mb-8">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-2 transition-transform hover:scale-110 cursor-pointer">
                          <Star size={40} className="text-gray-200 fill-gray-100" />
                        </div>
                      ))}
                    </div>
                    <button className="bg-[#0D9E75] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-xl shadow-[#0D9E75]/20">
                      Continuer
                    </button>
                  </div>
                )}

                {activeStep?.type === 'textarea' && (
                  <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-black tracking-tighter mb-4">{activeStep.title}</h2>
                    <p className="text-gray-500 mb-8">{activeStep.description}</p>
                    <textarea
                      className="w-full h-32 p-4 rounded-2xl border border-gray-100 bg-gray-50 mb-6 focus:ring-2 focus:ring-[#0D9E75]/20 outline-none transition-all placeholder:text-gray-300 italic"
                      placeholder="Tapez votre témoignage ici..."
                    />
                    <button className="bg-[#0D9E75] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-xl shadow-[#0D9E75]/20">
                      Envoyer
                    </button>
                  </div>
                )}

                {activeStep?.type === 'attribution' && (
                  <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-black tracking-tighter mb-4">{activeStep.title}</h2>
                    <p className="text-gray-500 mb-8">{activeStep.description}</p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                          <Plus size={20} />
                        </div>
                        <input className="flex-1 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none" placeholder="Votre nom" />
                      </div>
                      <input className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none" placeholder="Votre email" />
                    </div>
                    <button className="bg-[#0D9E75] text-white w-full py-3 mt-8 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] shadow-xl shadow-[#0D9E75]/20">
                      Terminer
                    </button>
                  </div>
                )}

                {activeStep?.type === 'success' && (
                  <div className="text-center animate-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-[#0D9E75]/10 text-[#0D9E75] rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter mb-4">{activeStep.title}</h2>
                    <p className="text-gray-500">{activeStep.description}</p>
                  </div>
                )}
              </div>

              {/* Attribution Footer */}
              {form.config.branding.showPoweredBy && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <span className="text-[#0D9E75] font-black">❤</span> Powered by Reviewskits
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar: Settings */}
          <aside className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-3xl flex flex-col overflow-hidden sticky top-8">
            <div className="flex border-b border-white/5 p-1 bg-white/5">
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pages' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'}`}
              >
                <Layout size={14} className="inline mr-2" />
                Étape
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'}`}
              >
                <Settings size={14} className="inline mr-2" />
                Design
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  {/* Step Selector for 2-column layout */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Choisir l'étape à éditer</label>
                    <div className="relative group">
                      <select
                        value={activeStepId || ''}
                        onChange={(e) => setActiveStepId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-[#0D9E75]/50 outline-none transition-all appearance-none cursor-pointer pr-10"
                      >
                        {form.config.steps.map((step, idx) => (
                          <option key={step.id} value={step.id} className="bg-[#0D0D0D] text-white">
                            {idx + 1}. {step.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none group-hover:text-white/60" />
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {activeStep && (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Titre de l'étape</label>
                        <input
                          value={activeStep.title}
                          onChange={(e) => {
                            const newSteps = [...form.config.steps]
                            const stepIdx = newSteps.findIndex(s => s.id === activeStepId)
                            newSteps[stepIdx].title = e.target.value
                            setForm({ ...form, config: { ...form.config, steps: newSteps } })
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#0D9E75]/50 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Description</label>
                        <textarea
                          value={activeStep.description || ''}
                          onChange={(e) => {
                            const newSteps = [...form.config.steps]
                            const stepIdx = newSteps.findIndex(s => s.id === activeStepId)
                            newSteps[stepIdx].description = e.target.value
                            setForm({ ...form, config: { ...form.config, steps: newSteps } })
                          }}
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#0D9E75]/50 outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Activer cette étape</span>
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
                      <input
                        type="color"
                        value={form.config.branding.primaryColor || '#0D9E75'}
                        onChange={(e) => setForm({ ...form, config: { ...form.config, branding: { ...form.config.branding, primaryColor: e.target.value } } })}
                        className="w-10 h-10 rounded-xl border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono opacity-60 uppercase">{form.config.branding.primaryColor}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">Powered by Reviewskits</span>
                      <button
                        onClick={() => setForm({ ...form, config: { ...form.config, branding: { ...form.config.branding, showPoweredBy: !form.config.branding.showPoweredBy } } })}
                        className={`w-10 h-5 rounded-full transition-all relative ${form.config.branding.showPoweredBy ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.config.branding.showPoweredBy ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed italic">Cachez notre marque en passant à l'offre Pro.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
