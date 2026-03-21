import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { DashboardForm } from './types'

interface CreateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (newForm: DashboardForm) => void
}

export function CreateFormModal({ isOpen, onClose, onCreated }: CreateFormModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, slug, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessage = typeof data.error === 'object' 
          ? (data.error.message || JSON.stringify(data.error))
          : (data.error || 'Failed to create form')
        throw new Error(errorMessage)
      }

      onCreated(data)
      setName('')
      setSlug('')
      setDescription('')
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] w-full max-w-[500px] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden scale-in">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--v3-border)]">
          <h2 className="text-xl font-bold tracking-tight text-[var(--v3-text)]">Nouveau Formulaire</h2>
          <button onClick={onClose} className="text-[var(--v3-muted)] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-teal)]">Nom du formulaire</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={handleNameChange}
              placeholder="ex: Feedback Produit SaaS"
              className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg px-4 py-3 text-sm text-[var(--v3-text)] focus:border-[var(--v3-teal)]/50 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-teal)]">Slug (URL)</label>
            <div className="flex">
               <div className="bg-[var(--v3-bg3)] border border-r-0 border-[var(--v3-border)] rounded-l-lg px-3 py-3 text-[12px] text-[var(--v3-muted)] font-mono min-w-fit">
                  reviewskits.com/f/
               </div>
               <input 
                 required
                 type="text" 
                 value={slug}
                 onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                 placeholder="slug-unique"
                 className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-r-lg px-4 py-3 text-sm text-[var(--v3-text)] focus:border-[var(--v3-teal)]/50 focus:outline-none transition-all"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-teal)]">Description (optionnelle)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="À quoi sert ce formulaire..."
              className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg px-4 py-3 text-sm text-[var(--v3-text)] focus:border-[var(--v3-teal)]/50 focus:outline-none transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               type="button"
               onClick={onClose}
               className="flex-1 bg-[var(--v3-bg3)] border border-[var(--v3-border)] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-white/5 transition-all"
             >
               Annuler
             </button>
             <button 
               type="submit"
               disabled={loading}
               className="flex-[2] bg-[var(--v3-teal)] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all flex items-center justify-center gap-2"
             >
               {loading && <Loader2 size={16} className="animate-spin" />}
               Créer le formulaire
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
