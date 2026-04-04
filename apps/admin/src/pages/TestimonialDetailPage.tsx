import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Star,
  Check,
  XCircle,
  Clock,
  ExternalLink,
  Mail,
  Briefcase,
  Globe,
  Calendar,
  MessageSquare,
  Loader2,
  Hash,
  List,
  AlignLeft,
  LayoutGrid
} from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'

interface TestimonialDetail {
  id: string
  content: string
  authorName: string
  authorEmail?: string
  authorTitle?: string
  authorUrl?: string
  rating?: number
  status: 'pending' | 'approved' | 'rejected'
  source: 'form' | 'import' | 'api'
  formId?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  approved: { label: 'Approved', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
}

const SOURCE_LABEL: Record<string, string> = {
  form: 'Form submission',
  import: 'Imported',
  api: 'API',
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getGradient(name: string) {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
  ]
  return gradients[name.charCodeAt(0) % gradients.length]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Detect and render the value of a metadata entry
function MetadataValue({ value }: { value: unknown }) {
  // NPS / number
  if (typeof value === 'number') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                i === value
                  ? 'bg-(--v3-teal) text-white'
                  : 'bg-(--v3-bg3) text-(--v3-muted) border border-(--v3-border)'
              }`}
            >
              {i}
            </div>
          ))}
        </div>
        <span className="text-xs text-(--v3-muted)">({value}/10)</span>
      </div>
    )
  }

  // Grid / object with row:column mapping
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, string>)
    return (
      <div className="mt-2 rounded-xl border border-(--v3-border) overflow-hidden">
        {entries.map(([row, col], i) => (
          <div
            key={row}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              i < entries.length - 1 ? 'border-b border-(--v3-border)' : ''
            }`}
          >
            <span className="text-(--v3-muted2)">{row}</span>
            <span className="font-bold text-(--v3-teal) bg-(--v3-teal-dim) px-2.5 py-0.5 rounded-lg text-xs">
              {col}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Choice / plain string
  return (
    <span className="inline-block mt-1 px-3 py-1.5 rounded-xl bg-(--v3-bg3) border border-(--v3-border) text-sm text-(--v3-text)">
      {String(value)}
    </span>
  )
}

function guessFieldIcon(value: unknown) {
  if (typeof value === 'number') return Hash
  if (typeof value === 'object' && value !== null) return LayoutGrid
  const str = String(value)
  if (str.length > 60) return AlignLeft
  return List
}

export default function TestimonialDetailPage() {
  const { id } = useParams<{ formId: string; id: string }>()
  const navigate = useNavigate()
  const [testimonial, setTestimonial] = useState<TestimonialDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const res = await fetch(`/api/v1/testimonials/${id}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Testimonial not found')
        }
        setTestimonial(await res.json())
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonial()
  }, [id])

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'pending') => {
    if (!testimonial || updating) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/v1/testimonials/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) setTestimonial(prev => prev ? { ...prev, status } : prev)
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-(--v3-bg) flex flex-col">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-(--v3-muted)" size={32} />
      </div>
    </div>
  )

  if (error || !testimonial) return (
    <div className="min-h-screen bg-(--v3-bg) flex flex-col">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-(--v3-muted)">
        <MessageSquare size={40} />
        <p className="text-sm">{error || 'Testimonial not found'}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-(--v3-teal) hover:underline">Go back</button>
      </div>
    </div>
  )

  const statusCfg = STATUS_CONFIG[testimonial.status]
  const StatusIcon = statusCfg.icon
  const gradient = getGradient(testimonial.authorName)
  const metaEntries = testimonial.metadata ? Object.entries(testimonial.metadata).filter(([, v]) => v !== undefined && v !== null && v !== '') : []

  return (
    <div className="min-h-screen bg-(--v3-bg) text-(--v3-text) flex flex-col">
      <TopBar />

      <main className="max-w-285 mx-auto px-6 py-8 flex flex-col gap-5">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-(--v3-muted) hover:text-(--v3-text) transition-colors text-sm w-fit"
        >
          <ChevronLeft size={16} />
          Back to reviews
        </button>

        {/* Two-column layout */}
        <div className="flex gap-5 items-start">

          {/* Left — main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Testimonial Content */}
            <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--v3-muted) mb-3">Testimonial</p>
              <blockquote className="text-(--v3-text) text-[15px] leading-relaxed italic opacity-80">
                "{testimonial.content}"
              </blockquote>
            </div>

            {/* Custom step answers */}
            {metaEntries.length > 0 && (
              <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--v3-muted) mb-4">Additional responses</p>
                <div className="space-y-5">
                  {metaEntries.map(([label, value]) => {
                    const Icon = guessFieldIcon(value)
                    return (
                      <div key={label}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={12} className="text-(--v3-muted) shrink-0" />
                          <span className="text-[12px] font-semibold text-(--v3-muted2)">{label}</span>
                        </div>
                        <MetadataValue value={value} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Author Card — compact */}
            <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${gradient} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                  {getInitials(testimonial.authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h1 className="text-[13px] font-bold text-(--v3-text) leading-none truncate">{testimonial.authorName}</h1>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                      <StatusIcon size={10} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {testimonial.authorEmail && (
                      <span className="flex items-center gap-1 text-[11px] text-(--v3-muted) truncate">
                        <Mail size={10} />{testimonial.authorEmail}
                      </span>
                    )}
                    {testimonial.authorTitle && (
                      <span className="flex items-center gap-1 text-[11px] text-(--v3-muted) truncate">
                        <Briefcase size={10} />{testimonial.authorTitle}
                      </span>
                    )}
                    {testimonial.authorUrl && (
                      <a
                        href={testimonial.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-(--v3-teal) hover:underline truncate"
                      >
                        <Globe size={10} />{testimonial.authorUrl}<ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating inline */}
              {testimonial.rating != null && (
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-(--v3-border)">
                  {[1, 2, 3, 4, 5].map(v => (
                    <Star
                      key={v}
                      size={13}
                      className={v <= testimonial.rating! ? 'fill-(--v3-yellow) text-(--v3-yellow)' : 'text-(--v3-border2) fill-(--v3-border2)'}
                    />
                  ))}
                  <span className="text-[11px] text-(--v3-muted) ml-1">{testimonial.rating}/5</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--v3-muted) mb-2">Details</p>
              <div className="flex items-center gap-2 text-[11px] text-(--v3-muted)">
                <Calendar size={11} />
                <span>{formatDate(testimonial.createdAt)}</span>
              </div>
              {testimonial.updatedAt !== testimonial.createdAt && (
                <div className="flex items-center gap-2 text-[11px] text-(--v3-muted)">
                  <Clock size={11} />
                  <span>Updated {formatDate(testimonial.updatedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] text-(--v3-muted)">
                <MessageSquare size={11} />
                <span>{SOURCE_LABEL[testimonial.source] ?? testimonial.source}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-4 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--v3-muted) mb-1">Actions</p>
              <button
                disabled={testimonial.status === 'approved' || updating}
                onClick={() => handleStatusUpdate('approved')}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Check size={12} /> Approve
              </button>
              <button
                disabled={testimonial.status === 'rejected' || updating}
                onClick={() => handleStatusUpdate('rejected')}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <XCircle size={12} /> Reject
              </button>
              <button
                disabled={testimonial.status === 'pending' || updating}
                onClick={() => handleStatusUpdate('pending')}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-(--v3-bg3) border border-(--v3-border) text-(--v3-muted) text-xs font-bold hover:border-(--v3-border2) transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Clock size={12} /> Set to pending
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
