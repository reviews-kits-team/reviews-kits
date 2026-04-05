import { type RefObject } from 'react'
import { Layout, Settings } from 'lucide-react'
import { EditorSidebarStepTab } from './EditorSidebarStepTab'
import { EditorSidebarDesignTab } from './EditorSidebarDesignTab'
import type { FormData, FormStep, StepField } from './types'

interface EditorSidebarProps {
  form: FormData
  activeTab: 'pages' | 'design'
  onTabChange: (tab: 'pages' | 'design') => void
  activeStepId: string | null
  sidebarRefs: RefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>
  onUpdateStep: (stepId: string, updates: Partial<FormStep>) => void
  onUpdateField: (stepId: string, fieldId: string, updates: Partial<StepField>) => void
  onAddField: (stepId: string, type: StepField['type']) => void
  onRemoveField: (stepId: string, fieldId: string) => void
  onDeleteStep: (stepId: string) => void
  onToggleStepEnabled: (stepId: string) => void
  onBrandingChange: (updates: Partial<FormData['config']['branding']>) => void
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
}

export function EditorSidebar({
  form,
  activeTab,
  onTabChange,
  activeStepId,
  sidebarRefs,
  onUpdateStep,
  onUpdateField,
  onAddField,
  onRemoveField,
  onDeleteStep,
  onToggleStepEnabled,
  onBrandingChange,
  onLogoUpload,
  onRemoveLogo,
}: EditorSidebarProps) {
  const activeStep = form.config.steps.find((s) => s.id === activeStepId)

  return (
    <aside className="order-last lg:order-last w-full lg:w-auto bg-(--v3-bg2) border border-(--v3-border) rounded-2xl lg:rounded-3xl flex flex-col overflow-hidden h-[40vh] lg:h-full z-40 shadow-2xl relative">
      {/* Tab bar */}
      <div className="flex border-b border-white/5 p-1 bg-white/5 shrink-0 sticky top-0 z-50">
        <button
          onClick={() => onTabChange('pages')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'pages' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Layout size={14} className="inline mr-2" />
          Step
        </button>
        <button
          onClick={() => onTabChange('design')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'design' ? 'bg-[#0D9E75] text-white shadow-lg shadow-[#0D9E75]/20' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Settings size={14} className="inline mr-2" />
          Design
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'pages' && (
          <EditorSidebarStepTab
            activeStep={activeStep}
            activeStepId={activeStepId}
            sidebarRefs={sidebarRefs}
            onUpdateStep={onUpdateStep}
            onUpdateField={onUpdateField}
            onAddField={onAddField}
            onRemoveField={onRemoveField}
            onDeleteStep={onDeleteStep}
            onToggleStepEnabled={onToggleStepEnabled}
          />
        )}
        {activeTab === 'design' && (
          <EditorSidebarDesignTab
            form={form}
            onBrandingChange={onBrandingChange}
            onLogoUpload={onLogoUpload}
            onRemoveLogo={onRemoveLogo}
          />
        )}
      </div>
    </aside>
  )
}
