import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCreateForm } from '../../hooks/useForms'

interface CreateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateFormModal({ isOpen, onClose, onCreated }: CreateFormModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const createForm = useCreateForm()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createForm.reset()
    try {
      await createForm.mutateAsync({ name, slug, description })
      setName('')
      setSlug('')
      setDescription('')
      onCreated()
      onClose()
    } catch {
      // error surfaced via createForm.error
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-(--v3-bg2) border border-(--v3-border) w-full max-w-125 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden scale-in">
        <div className="flex justify-between items-center px-6 py-5 border-b border-(--v3-border)">
          <h2 className="text-xl font-bold tracking-tight text-(--v3-text)">New Form</h2>
          <button onClick={onClose} className="text-(--v3-muted) hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {createForm.error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg">
              {createForm.error.message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--v3-teal)">Form name</label>
            <input
              required
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="ex: SaaS Product Feedback"
              className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-lg px-4 py-3 text-sm text-(--v3-text) focus:border-(--v3-teal)/50 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--v3-teal)">Slug (URL)</label>
            <div className="flex">
              <div className="bg-(--v3-bg3) border border-r-0 border-(--v3-border) rounded-l-lg px-3 py-3 text-[12px] text-(--v3-muted) font-mono min-w-fit">
                reviewskits.com/f/
              </div>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                placeholder="slug-unique"
                className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-r-lg px-4 py-3 text-sm text-(--v3-text) focus:border-(--v3-teal)/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--v3-teal)">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this form for..."
              className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-lg px-4 py-3 text-sm text-(--v3-text) focus:border-(--v3-teal)/50 focus:outline-none transition-all min-h-25 resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-(--v3-bg3) border border-(--v3-border) text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createForm.isPending}
              className="flex-2 bg-(--v3-teal) text-white px-5 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all flex items-center justify-center gap-2"
            >
              {createForm.isPending && <Loader2 size={16} className="animate-spin" />}
              Create Form
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
