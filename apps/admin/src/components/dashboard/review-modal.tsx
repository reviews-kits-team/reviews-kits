import { X, Check, XCircle, Calendar, Mail } from 'lucide-react'
import { Stars, Badge } from './ui'

interface Testimonial {
  id: string
  authorName: string
  content: string
  rating: number
  createdAt: string
  status: string
  authorEmail?: string
}

interface ReviewModalProps {
  review: Testimonial | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (id: string, status: string) => void
  formatDate: (date: string) => string
  getRandomGradient: (name: string) => string
  getInitials: (name: string) => string
}

export function ReviewModal({
  review,
  isOpen,
  onClose,
  onStatusUpdate,
  formatDate,
  getRandomGradient,
  getInitials
}: ReviewModalProps) {
  if (!isOpen || !review) return null

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-(--v3-bg2) border border-(--v3-border) w-full max-w-137.5 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden scale-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-(--v3-border)">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--v3-teal) mb-1 block">
              // review details
            </span>
            <h2 className="text-xl font-bold tracking-tight text-(--v3-text)">
              Full Testimonial
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-(--v3-muted) hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Author Details */}
          <div className="flex items-start gap-4 p-4 bg-(--v3-bg) border border-(--v3-border) rounded-xl">
            <div 
              className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-sm font-black text-white" 
              style={{ background: getRandomGradient(review.authorName) }}
            >
              {getInitials(review.authorName)}
            </div>
            <div className="flex-1 min-w-0">
               <div className="font-bold text-(--v3-text) truncate">{review.authorName}</div>
               <div className="flex flex-col gap-1 mt-1">
                 <div className="flex items-center gap-1.5 text-[11px] text-(--v3-muted2)">
                   <Mail size={12} className="opacity-50" />
                   {review.authorEmail || 'N/A'}
                 </div>
                 <div className="flex items-center gap-1.5 text-[11px] text-(--v3-muted2)">
                   <Calendar size={12} className="opacity-50" />
                   {formatDate(review.createdAt)}
                 </div>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge status={review.status} />
                <Stars rating={review.rating} size={10} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-(--v3-teal)">
               // content
            </span>
            <div className="bg-(--v3-bg) border border-(--v3-border) rounded-xl p-6 relative">
              <p className="text-[14px] text-(--v3-text) leading-relaxed italic selection:bg-(--v3-teal)/30">
                "{review.content}"
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => { onStatusUpdate(review.id, 'approved'); onClose(); }}
              className="flex-1 min-w-35 flex items-center justify-center gap-2 bg-(--v3-teal)/10 text-(--v3-teal) border border-(--v3-teal)/20 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-(--v3-teal)/20 hover:border-(--v3-teal)/40 transition-all"
            >
              <Check size={14} /> Approve
            </button>
            <button 
              onClick={() => { onStatusUpdate(review.id, 'rejected'); onClose(); }}
              className="flex-1 min-w-35 flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
