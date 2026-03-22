import { useState, useEffect, useCallback } from 'react'
import { 
  ChevronLeft as ChevronLeftIcon,
  Share2, 
  MessageSquare, 
  Star, 
  Users,
  TrendingUp,
  Pencil,
  RefreshCw,
  Check,
  XCircle,
  Trash2,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatCard } from './stat-card'
import { Stars, Badge, Checkbox } from './ui'
import type { DashboardForm } from './types'

interface FormStats {
  totalReviews: number
  averageRating: number
  uniqueRespondents: number
  ratingDistribution: { rating: number; count: number }[]
  reviewVolume: { label: string; value: number }[]
}

interface Testimonial {
  id: string
  authorName: string
  content: string
  rating: number
  createdAt: string
  status: string
  authorEmail?: string
}

interface DetailViewProps {
  form: DashboardForm
  onBack: () => void
  onShare: (id: string | null) => void
}

const SortIcon = ({ field, sortConfig }: { field: string; sortConfig: { field: string | null; order: 'asc' | 'desc' } }) => {
  if (sortConfig.field !== field) return null
  return sortConfig.order === 'desc' ? <ArrowDown size={10} className="ml-1" /> : <ArrowUp size={10} className="ml-1" />
}

interface SortableTestimonialRowProps {
  testimonial: Testimonial
  isSelected: boolean
  onSelect: (id: string) => void
  onStatusUpdate: (id: string, status: string) => void
  onDelete: (id: string) => void
  formatDate: (date: string) => string
  getRandomGradient: (name: string) => string
  getInitials: (name: string) => string
}

const SortableTestimonialRow = ({ 
  testimonial, 
  isSelected, 
  onSelect, 
  onStatusUpdate, 
  onDelete, 
  formatDate, 
  getRandomGradient, 
  getInitials 
}: SortableTestimonialRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: testimonial.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`group hover:bg-white/[0.03] transition-colors ${isSelected ? 'bg-[var(--v3-teal)]/5' : ''} ${isDragging ? 'bg-[var(--v3-teal)]/10 shadow-2xl relative z-50' : ''}`}
      onClick={() => onSelect(testimonial.id)}
    >
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-[var(--v3-muted2)] hover:text-[var(--v3-text)] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical size={14} />
          </div>
          <Checkbox 
            checked={isSelected} 
            onChange={() => onSelect(testimonial.id)} 
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-lg" style={{ background: getRandomGradient(testimonial.authorName) }}>
            {getInitials(testimonial.authorName)}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[var(--v3-text)] leading-tight">{testimonial.authorName}</span>
            <span className="text-[10px] font-medium text-[var(--v3-muted2)] leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
              {testimonial.authorEmail || 'N/A'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 max-w-sm">
        <p className="text-[13px] text-[var(--v3-muted2)] leading-relaxed line-clamp-2 italic group-hover:text-[var(--v3-text)] transition-colors">
          "{testimonial.content}"
        </p>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center">
          <Stars rating={testimonial.rating} size={10} />
          <span className="text-[10px] font-black text-[var(--v3-text)] mt-1">{testimonial.rating}/5</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <Badge status={testimonial.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-bold text-[var(--v3-text)]">{formatDate(testimonial.createdAt)}</span>
          <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onStatusUpdate(testimonial.id, 'approved')}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--v3-teal)]/10 text-[var(--v3-teal)] hover:bg-[var(--v3-teal)] hover:text-white transition-all shadow-sm"
              title="Approuver"
            >
              <Check size={12} />
            </button>
            <button 
              onClick={() => onStatusUpdate(testimonial.id, 'rejected')}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              title="Rejeter"
            >
              <XCircle size={12} />
            </button>
            <button 
              onClick={() => onDelete(testimonial.id)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 text-[var(--v3-muted2)] hover:bg-red-600 hover:text-white transition-all"
              title="Supprimer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

export const DetailView = ({ form, onBack, onShare }: DetailViewProps) => {
  const [stats, setStats] = useState<FormStats | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ field: string | null; order: 'asc' | 'desc' }>({ field: null, order: 'desc' })
  const [copyingId, setCopyingId] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchData = useCallback(async (currentPage: number = page, sort = sortConfig) => {
    try {
      const [statsRes, testimonialsRes] = await Promise.all([
        fetch(`/api/v1/forms/${form.id}/stats`),
        fetch(`/api/v1/forms/${form.id}/testimonials?page=${currentPage}${sort.field ? `&sort=${sort.field}&order=${sort.order}` : ''}`)
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (testimonialsRes.ok) setTestimonials(await testimonialsRes.json())
    } catch (error) {
      console.error("Failed to fetch form details", error)
    }
  }, [form.id, page, sortConfig])

  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true)
      await fetchData(page)
      setLoading(false)
    }

    fetchDetailData()
  }, [form.id, page, fetchData])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/testimonials/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        await fetchData(page)
      }
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Es-tu sûr de vouloir supprimer cet avis ? Cette action est irréversible.")) return
    try {
      const res = await fetch(`/api/v1/testimonials/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await fetchData(page)
      }
    } catch (error) {
      console.error("Failed to delete testimonial", error)
    }
  }

  const handleBatchStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch('/api/v1/testimonials/batch-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      })
      if (res.ok) {
        setSelectedIds([])
        await fetchData(page)
      }
    } catch (error) {
      console.error("Batch update failed", error)
    }
  }

  const handleBatchDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.length} avis ?`)) return
    try {
      const res = await fetch('/api/v1/testimonials/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      })
      if (res.ok) {
        setSelectedIds([])
        await fetchData(page)
      }
    } catch (error) {
      console.error("Batch delete failed", error)
    }
  }

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }))
    setPage(1)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = testimonials.findIndex((t) => t.id === active.id)
    const newIndex = testimonials.findIndex((t) => t.id === over.id)
    const newTestimonials = arrayMove(testimonials, oldIndex, newIndex)
    
    setTestimonials(newTestimonials)

    // Persist new order
    try {
      // Position is simply the index in the current list
      const positions = newTestimonials.map((t, index) => ({
        id: t.id,
        position: index + ((page - 1) * 10)
      }))

      await fetch('/api/v1/testimonials/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions })
      })
    } catch (error) {
      console.error("Failed to persist new order", error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === testimonials.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(testimonials.map(t => t.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const copyPublicId = () => {
    navigator.clipboard.writeText(form.publicId)
    setCopyingId(true)
    setTimeout(() => setCopyingId(false), 2000)
  }

  const totReviews = stats?.totalReviews || 0
  const avgRating = stats?.averageRating || 0
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRandomGradient = (name: string) => {
    const gradients = [
      "linear-gradient(135deg,#0D9E75,#0a6e52)",
      "linear-gradient(135deg,#7c3aed,#4f46e5)",
      "linear-gradient(135deg,#f59e0b,#d97706)",
      "linear-gradient(135deg,#e05454,#c03030)",
      "linear-gradient(135deg,#3b82f6,#2563eb)",
    ]
    const index = name.length % gradients.length
    return gradients[index]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInSeconds < 60) return "À l'instant"
    if (diffInMinutes < 60) return `${diffInMinutes}min`
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInDays < 7) return `${diffInDays}j`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading && !stats) {
    return (
      <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
        <div className="flex flex-col items-center justify-center py-20 text-[var(--v3-muted)]">
          <RefreshCw size={24} className="animate-spin mb-4 text-[var(--v3-teal)]" />
          <p className="text-sm font-medium">Chargement des données...</p>
        </div>
      </main>
    )
  }


  return (
    <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--v3-muted2)] hover:text-[var(--v3-teal)] transition-colors mb-6"
      >
        <ChevronLeftIcon size={14} />
        Retour au Dashboard
      </button>

      <div className="mb-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
          // formulaire
        </span>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-[clamp(20px,2.5vw,28px)] font-extrabold tracking-tighter leading-tight text-[var(--v3-text)] mb-3">
              {form.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <div 
                onClick={copyPublicId}
                className="flex items-center gap-2.5 bg-white/5 border border-white/10 text-[var(--v3-muted2)] pl-3 pr-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <span className="opacity-60">ID:</span>
                <span className="text-[var(--v3-text)] opacity-100">{form.publicId}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${copyingId ? 'bg-[var(--v3-teal)] text-white' : 'bg-white/5 text-[var(--v3-muted2)] group-hover:bg-white/10'}`}>
                  {copyingId ? <Check size={12} /> : <Copy size={12} />}
                </div>
              </div>

              <button 
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-[var(--v3-text)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <Pencil size={13} className="text-[var(--v3-muted2)] group-hover:text-[var(--v3-teal)] transition-colors" />
                Modifier
              </button>

              <button 
                onClick={() => onShare(form.id)}
                className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Share2 size={13} />
                Partager
              </button>

              <div className="h-4 w-px bg-white/10 mx-1" />

              <div className="flex items-center gap-2.5">
                <Badge status={form.isActive ? 'active' : 'draft'} />
                {avgRating > 0 && (
                  <div className="flex items-center gap-1 ml-1">
                    <Stars rating={avgRating} />
                    <span className="text-[13px] font-semibold text-[var(--v3-text)]">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<MessageSquare size={18} />} label="Total reviews" value={totReviews.toString()} delta="↑ +12%" colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]" />
        <StatCard icon={<TrendingUp size={18} />} label="Complétion" value={`${form.completion || 100}%`} delta="↑ +4%" colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500" />
        <StatCard icon={<Star size={18} />} label="Note moyenne" value={avgRating > 0 ? avgRating.toFixed(1) : "—"} colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" />
        <StatCard icon={<Users size={18} />} label="Répondants uniques" value={(stats?.uniqueRespondents || 0).toString()} colorClass="bg-purple-500/10 border-purple-500/20 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-8">
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
          <div className="text-sm font-bold text-[var(--v3-text)] mb-1.5">Volume de reviews</div>
          <div className="text-[12px] text-[var(--v3-muted2)] mb-5">12 dernières semaines</div>
          <div className="flex items-end gap-1.5 h-[120px]">
            {stats?.reviewVolume.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--v3-muted)] italic">Pas encore assez de données</div>
            ) : (
                stats?.reviewVolume.map((v, i) => {
                    const maxVolume = Math.max(...stats.reviewVolume.map(rv => rv.value), 1)
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full group">
                            <div 
                            className="w-full bg-[var(--v3-teal)]/25 rounded-t-[4px] mt-auto group-hover:bg-[var(--v3-teal)] transition-all cursor-pointer" 
                            style={{ height: `${Math.max(5, Math.round((v.value / maxVolume) * 100))}%` }}
                            />
                            <div className="text-[8px] text-[var(--v3-muted)] text-center font-bold tracking-tighter opacity-70">{v.label}</div>
                        </div>
                    )
                })
            )}
          </div>
        </div>
        <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6">
          <div className="text-sm font-bold text-[var(--v3-text)] mb-1.5">Répartition des notes</div>
          <div className="text-[12px] text-[var(--v3-muted2)] mb-5">{totReviews} reviews</div>
          <div className="space-y-3 mb-4">
            {(stats?.ratingDistribution || []).map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-[var(--v3-muted2)] w-6 shrink-0">{s.rating} ★</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ 
                        width: `${totReviews > 0 ? Math.round((s.count / totReviews) * 100) : 0}%`, 
                        backgroundColor: s.rating >= 4 ? 'var(--v3-teal)' : s.rating === 3 ? '#ca8a04' : '#ef4444' 
                    }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-[var(--v3-muted2)] w-4 text-right shrink-0">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
            <span className="text-[32px] font-black tracking-tighter text-[var(--v3-text)]">{avgRating > 0 ? avgRating.toFixed(1) : "0.0"}</span>
            <div>
              <Stars rating={avgRating} size={13} />
              <div className="text-[10px] font-bold text-[var(--v3-muted)] mt-0.5 uppercase tracking-wider">Moyenne</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--v3-border)] bg-white/[0.01]">
          <span className="text-[14px] font-black uppercase tracking-widest text-[var(--v3-text)] opacity-80">
            // Gestion des avis
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-[var(--v3-muted2)]">{totReviews} au total</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--v3-border)] text-left bg-white/[0.01]">
                <th className="px-6 py-4 w-10">
                  <Checkbox 
                    checked={testimonials.length > 0 && selectedIds.length === testimonials.length} 
                    onChange={toggleSelectAll} 
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)] cursor-pointer hover:text-[var(--v3-teal)] transition-colors" onClick={() => handleSort('authorName')}>
                  <div className="flex items-center">Auteur <SortIcon field="authorName" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)]">Avis</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)] text-center cursor-pointer hover:text-[var(--v3-teal)] transition-colors" onClick={() => handleSort('rating')}>
                  <div className="flex items-center justify-center">Note <SortIcon field="rating" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)] text-center cursor-pointer hover:text-[var(--v3-teal)] transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center">Statut <SortIcon field="status" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)] text-right cursor-pointer hover:text-[var(--v3-teal)] transition-colors" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center justify-end">Date <SortIcon field="createdAt" sortConfig={sortConfig} /></div>
                </th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={testimonials.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-[var(--v3-border)]">
                  {testimonials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[var(--v3-muted2)] italic text-sm">
                        Aucun avis trouvé.
                      </td>
                    </tr>
                  ) : (
                    testimonials.map((r) => (
                      <SortableTestimonialRow
                        key={r.id}
                        testimonial={r}
                        isSelected={selectedIds.includes(r.id)}
                        onSelect={toggleSelectOne}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        getRandomGradient={getRandomGradient}
                        getInitials={getInitials}
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--v3-bg)] border border-[var(--v3-teal)]/30 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(45,212,191,0.1)] backdrop-blur-xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="w-6 h-6 rounded-full bg-[var(--v3-teal)] text-white text-[11px] font-black flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                {selectedIds.length}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[var(--v3-text)]">Sélectionnés</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleBatchStatusUpdate('approved')}
                className="flex items-center gap-2 bg-[var(--v3-teal)]/10 text-[var(--v3-teal)] border border-[var(--v3-teal)]/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--v3-teal)] hover:text-white transition-all"
              >
                <Check size={14} /> Approuver
              </button>
              <button 
                onClick={() => handleBatchStatusUpdate('rejected')}
                className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                <XCircle size={14} /> Rejeter
              </button>
              <button 
                onClick={handleBatchDelete}
                className="flex items-center gap-2 bg-white/5 text-[var(--v3-muted2)] border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>

            <button 
              onClick={() => setSelectedIds([])}
              className="text-[10px] font-black uppercase tracking-widest text-[var(--v3-muted2)] hover:text-[var(--v3-text)] ml-2"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-white/[0.01] border-t border-[var(--v3-border)]">
          <div className="text-[11px] font-bold text-[var(--v3-muted2)]">
            Page <span className="text-[var(--v3-text)]">{page}</span> sur <span className="text-[var(--v3-text)]">{Math.ceil(totReviews / 10) || 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1 px-3 rounded-lg border border-white/5 bg-white/5 text-[var(--v3-muted2)] text-[11px] font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all flex items-center gap-1"
            >
              <ChevronLeftIcon size={12} /> Précédent
            </button>
            <button 
              disabled={page >= Math.ceil(totReviews / 10)}
              onClick={() => setPage(p => p + 1)}
              className="p-1 px-3 rounded-lg border border-white/5 bg-white/5 text-[var(--v3-muted2)] text-[11px] font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all flex items-center gap-1"
            >
              Suivant <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
