import { useState, useRef } from 'react'
import { X, Upload, Check, AlertCircle, Loader2, FileJson, FileSpreadsheet, ChevronRight } from 'lucide-react'

interface MigrationModalProps {
  isOpen: boolean
  onClose: () => void
  formId: string
  onImported: () => void
}

type Step = 'source' | 'upload' | 'mapping' | 'preview' | 'importing' | 'success'

export function MigrationModal({ isOpen, onClose, formId, onImported }: MigrationModalProps) {
  const [step, setStep] = useState<Step>('source')
  const [source, setSource] = useState<'trustpilot' | 'senja' | 'csv' | 'json' | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStep('preview')
    }
  }

  const startImport = async () => {
    if (!file || !formId) return
    setIsProcessing(true)
    setError(null)
    setStep('importing')

    try {
      const text = await file.text()
      let data: Record<string, string | number>[] = []

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Very basic CSV parser for MVP
        const lines = text.split('\n')
        const headerLine = lines[0]
        if (!headerLine) {
          throw new Error('Empty CSV file')
        }
        const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''))
        data = lines.slice(1).filter(l => l.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const obj: Record<string, string> = {}
          headers.forEach((h, i) => {
            obj[h] = values[i]
          })
          return obj
        })
      }

      // Map common fields based on source
      const mappedData = data.map(item => ({
        authorName: (item.authorName || item.author || item.name || 'Anonymous') as string,
        authorEmail: (item.authorEmail || item.email || undefined) as string | undefined,
        rating: Number(item.rating || item.stars || 5),
        content: (item.content || item.review || item.text || '') as string,
        createdAt: (item.createdAt || item.date || new Date().toISOString()) as string
      }))

      const res = await fetch('/api/v1/testimonials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data: mappedData })
      })

      if (res.ok) {
        const result = await res.json()
        setImportedCount(result.importedCount)
        setStep('success')
        onImported()
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to import reviews')
        setStep('preview')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStep('preview')
    } finally {
      setIsProcessing(false)
    }
  }

  const sources = [
    { id: 'trustpilot', name: 'Trustpilot', icon: <StarColored />, color: 'bg-[#00b67a]/10 text-[#00b67a] border-[#00b67a]/20' },
    { id: 'senja', name: 'Senja', icon: <SenjaLogo />, color: 'bg-[#5a29e4]/10 text-[#5a29e4] border-[#5a29e4]/20' },
    { id: 'csv', name: 'CSV File', icon: <FileSpreadsheet size={20} />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'json', name: 'JSON File', icon: <FileJson size={20} />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ]

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-(--v3-border) flex items-center justify-between bg-(--v3-bg3)/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal)">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-black text-xl text-(--v3-text)">Import Testimonials</h3>
              <p className="text-[10px] font-bold text-(--v3-muted2) uppercase tracking-widest">Migration Wizard</p>
            </div>
          </div>
          <button onClick={onClose} className="text-(--v3-muted2) hover:text-(--v3-text) transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'source' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h4 className="text-(--v3-text) font-bold mb-2">Where are your reviews?</h4>
                <p className="text-xs text-(--v3-muted2)">Select the platform you want to migrate from.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sources.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSource(s.id as 'trustpilot' | 'senja' | 'csv' | 'json'); setStep('upload') }}
                    className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${s.color}`}
                  >
                    {s.icon}
                    <span className="font-bold text-sm uppercase tracking-wider">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <button 
                onClick={() => setStep('source')}
                className="text-[10px] font-bold uppercase tracking-widest text-(--v3-muted2) hover:text-(--v3-teal) mb-4"
              >
                ← Back to sources
              </button>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-(--v3-border) rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all hover:border-(--v3-teal) hover:bg-(--v3-teal)/5 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-(--v3-bg3) flex items-center justify-center text-(--v3-muted2) group-hover:text-(--v3-teal) transition-colors">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="text-(--v3-text) font-bold mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-(--v3-muted2)">Support for {source === 'csv' ? '.csv' : source === 'json' ? '.json' : 'official exports'}</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept={source === 'json' ? '.json' : '.csv'}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-(--v3-bg3) border border-(--v3-border) rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal)">
                  {file?.name.endsWith('.json') ? <FileJson size={24} /> : <FileSpreadsheet size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-(--v3-text)">{file?.name}</p>
                  <p className="text-[10px] text-(--v3-muted2) uppercase tracking-widest">Ready to import</p>
                </div>
                <button onClick={() => setStep('upload')} className="text-xs font-bold text-red-400 hover:underline">Remove</button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                  <AlertCircle size={16} />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="bg-(--v3-teal)/5 border border-(--v3-teal)/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Check className="text-(--v3-teal)" size={16} />
                  <p className="text-xs text-(--v3-text) font-medium">Auto-detecting headers...</p>
                </div>
                <p className="text-[10px] text-(--v3-muted2) leading-relaxed">
                  We will automatically map fields like Author, Content, and Rating. You can review and edit these after the import is complete.
                </p>
              </div>

              <button
                onClick={startImport}
                disabled={isProcessing}
                className="w-full py-4 bg-(--v3-teal) text-white font-bold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                Start Migration
              </button>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-(--v3-teal)/10 border-t-(--v3-teal) animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-(--v3-teal)">
                  <Upload size={32} />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-(--v3-text) font-bold text-lg mb-2">Importing your reviews</h4>
                <p className="text-xs text-(--v3-muted2)">Please don't close this window.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal) shadow-[0_0_40px_rgba(45,212,191,0.2)] animate-bounce">
                <Check size={40} />
              </div>
              <div>
                <h4 className="text-(--v3-text) font-bold text-2xl mb-2">Migration Successful!</h4>
                <p className="text-sm text-(--v3-muted2)">
                  Successfully imported <span className="text-(--v3-teal) font-black">{importedCount}</span> testimonials into your platform.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-(--v3-teal) text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StarColored() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="#00b67a" />
    </svg>
  )
}

function SenjaLogo() {
  return (
    <div className="w-6 h-6 rounded-lg bg-[#5a29e4] flex items-center justify-center text-white font-black text-[10px]">
      S
    </div>
  )
}
