import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'
import { EditorToolbar } from '../components/form-editor/EditorToolbar'
import { EditorCanvas } from '../components/form-editor/EditorCanvas'
import { EditorSidebar } from '../components/form-editor/EditorSidebar'
import type { FormStep, StepField } from '../components/form-editor/types'
import type { FullForm } from '../services/forms.service'
import { useFormById, useSaveForm } from '../hooks/useFormDetail'

// ── Page shell — handles loading state ────────────────────────────────────────
export default function FormEditorPage() {
  const { id } = useParams()
  const { data: remoteForm, isLoading } = useFormById(id)

  if (isLoading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  if (!remoteForm) return <div className="flex items-center justify-center h-screen text-white">Form not found</div>

  // key={id} ensures state resets if navigating between different forms
  return <FormEditorContent key={id} initialForm={remoteForm} formId={id!} />
}

// ── Editor content — receives initialForm as prop, owns local draft state ─────
function FormEditorContent({ initialForm, formId }: { initialForm: FullForm; formId: string }) {
  const navigate = useNavigate()
  const saveForm = useSaveForm(formId)

  // Local draft — initialized once from server data (no useEffect needed)
  const [form, setForm] = useState<FullForm>(initialForm)
  const [activeTab, setActiveTab] = useState<'pages' | 'design'>('pages')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeStepId, setActiveStepId] = useState<string | null>(
    initialForm.config?.steps?.[0]?.id ?? null
  )
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showSharePopover, setShowSharePopover] = useState(false)
  const [copied, setCopied] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sidebarRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

  // ── Intersection observer → sync activeStepId with scroll ─────────────────
  // Note: observer setup is handled inline via ref callbacks; no effect needed here
  // because canvasRef is stable and stepRefs are populated by the canvas itself.

  // ── Canvas helpers ─────────────────────────────────────────────────────────
  const scrollToStep = useCallback((stepId: string) => {
    stepRefs.current[stepId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleElementClick = useCallback((elementKey: string, stepId: string) => {
    setActiveStepId(stepId)
    setSelectedElement(elementKey)
    scrollToStep(stepId)
    setTimeout(() => {
      const input = sidebarRefs.current[elementKey]
      if (input) { input.focus(); input.select() }
    }, 100)
  }, [scrollToStep])

  // ── Step mutations ─────────────────────────────────────────────────────────
  const updateStep = useCallback((stepId: string, updates: Partial<FormStep>) => {
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        steps: prev.config.steps.map((s) => s.id === stepId ? { ...s, ...updates } : s),
      },
    }))
  }, [])

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const steps = [...prev.config.steps]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= steps.length || steps[target].locked) return prev
      ;[steps[index], steps[target]] = [steps[target], steps[index]]
      setTimeout(() => scrollToStep(steps[index].id), 100)
      return { ...prev, config: { ...prev.config, steps } }
    })
  }, [scrollToStep])

  const deleteStep = useCallback((stepId: string) => {
    setForm((prev) => {
      const step = prev.config.steps.find((s) => s.id === stepId)
      if (step?.locked) return prev
      const steps = prev.config.steps.filter((s) => s.id !== stepId)
      setActiveStepId(steps[0]?.id ?? null)
      return { ...prev, config: { ...prev.config, steps } }
    })
  }, [])

  const addStep = useCallback(() => {
    setForm((prev) => {
      const newId = `step_${Date.now()}`
      const newStep: FormStep = {
        id: newId,
        type: 'custom',
        title: 'New question',
        description: 'Add a description for this step',
        isEnabled: true,
        locked: false,
        config: {
          fields: [{ id: `field_${Date.now()}`, type: 'text', label: 'Your question?', placeholder: 'Type your answer...' }],
          buttonText: 'Continue',
        },
      }
      const insertAt = prev.config.steps.findIndex(
        (s) => s.type === 'identity' || s.type === 'attribution'
      )
      const steps = insertAt >= 0
        ? [...prev.config.steps.slice(0, insertAt), newStep, ...prev.config.steps.slice(insertAt)]
        : [...prev.config.steps, newStep]
      setTimeout(() => scrollToStep(newId), 100)
      return { ...prev, config: { ...prev.config, steps } }
    })
  }, [scrollToStep])

  const toggleStepEnabled = useCallback((stepId: string) => {
    setForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        steps: prev.config.steps.map((s) =>
          s.id === stepId ? { ...s, isEnabled: !s.isEnabled } : s
        ),
      },
    }))
  }, [])

  // ── Field mutations ────────────────────────────────────────────────────────
  const getFields = (step: FormStep) =>
    ((step.config as Record<string, unknown>)?.fields || []) as StepField[]

  const addField = useCallback((stepId: string, fieldType: StepField['type']) => {
    setForm((prev) => {
      const step = prev.config.steps.find((s) => s.id === stepId)
      if (!step) return prev
      const defaults: Record<StepField['type'], Partial<StepField>> = {
        text: { label: 'Short answer', placeholder: 'Type your answer...' },
        nps: { label: 'How likely are you to recommend us? (0–10)' },
        choice: { label: 'Choose an option', options: ['Option A', 'Option B', 'Option C'] },
        grid: { label: 'Rate these aspects', rows: ['Quality', 'Speed', 'Support'], options: ['1', '2', '3', '4', '5'] },
      }
      const newField: StepField = { id: `field_${Date.now()}`, type: fieldType, label: '', ...defaults[fieldType] }
      const fields = [...getFields(step), newField]
      return {
        ...prev,
        config: {
          ...prev.config,
          steps: prev.config.steps.map((s) =>
            s.id === stepId ? { ...s, config: { ...s.config, fields } } : s
          ),
        },
      }
    })
  }, [])

  const removeField = useCallback((stepId: string, fieldId: string) => {
    setForm((prev) => {
      const step = prev.config.steps.find((s) => s.id === stepId)
      if (!step) return prev
      const fields = getFields(step).filter((f) => f.id !== fieldId)
      return {
        ...prev,
        config: {
          ...prev.config,
          steps: prev.config.steps.map((s) =>
            s.id === stepId ? { ...s, config: { ...s.config, fields } } : s
          ),
        },
      }
    })
  }, [])

  const updateField = useCallback((stepId: string, fieldId: string, updates: Partial<StepField>) => {
    setForm((prev) => {
      const step = prev.config.steps.find((s) => s.id === stepId)
      if (!step) return prev
      const fields = getFields(step).map((f) => f.id === fieldId ? { ...f, ...updates } : f)
      return {
        ...prev,
        config: {
          ...prev.config,
          steps: prev.config.steps.map((s) =>
            s.id === stepId ? { ...s, config: { ...s.config, fields } } : s
          ),
        },
      }
    })
  }, [])

  // ── Branding mutations ─────────────────────────────────────────────────────
  const handleBrandingChange = useCallback((updates: Partial<FullForm['config']['branding']>) => {
    setForm((prev) => ({
      ...prev,
      config: { ...prev.config, branding: { ...prev.config.branding, ...updates } },
    }))
  }, [])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => handleBrandingChange({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }, [handleBrandingChange])

  const handleRemoveLogo = useCallback(() => handleBrandingChange({ logoUrl: undefined }), [handleBrandingChange])

  // ── Share / Save ───────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.publicId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [form.publicId])

  const handleSave = useCallback(() => {
    saveForm.mutate({ name: form.name, config: form.config })
  }, [form, saveForm])

  return (
    <div className="h-screen bg-[#0A0A0A] text-white flex flex-col overflow-hidden">
      <TopBar />

      <main className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <EditorToolbar
            formName={form.name}
            onNameChange={(name) => setForm({ ...form, name })}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            showSharePopover={showSharePopover}
            onSharePopoverToggle={() => setShowSharePopover((v) => !v)}
            publicId={form.publicId}
            copied={copied}
            onCopyLink={handleCopyLink}
            onSave={handleSave}
            onBack={() => navigate(-1)}
          />

          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 min-h-0 overflow-hidden">
            <EditorCanvas
              form={form}
              canvasRef={canvasRef}
              stepRefs={stepRefs}
              activeStepId={activeStepId}
              previewMode={previewMode}
              selectedElement={selectedElement}
              onElementClick={handleElementClick}
              onScrollToStep={scrollToStep}
              onMoveStep={moveStep}
              onDeleteStep={deleteStep}
              onAddStep={addStep}
            />

            <EditorSidebar
              form={form}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeStepId={activeStepId}
              sidebarRefs={sidebarRefs}
              onUpdateStep={updateStep}
              onUpdateField={updateField}
              onAddField={addField}
              onRemoveField={removeField}
              onDeleteStep={deleteStep}
              onToggleStepEnabled={toggleStepEnabled}
              onBrandingChange={handleBrandingChange}
              onLogoUpload={handleLogoUpload}
              onRemoveLogo={handleRemoveLogo}
            />
          </div>
        </div>
      </main>

      {saveForm.isSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0D9E75] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-9999">
          <CheckCircle size={20} className="text-white" />
          <span className="font-bold text-sm">Changes saved!</span>
        </div>
      )}
      {saveForm.isError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-9999">
          <span className="font-bold text-sm">Failed to save. Please try again.</span>
        </div>
      )}
    </div>
  )
}
