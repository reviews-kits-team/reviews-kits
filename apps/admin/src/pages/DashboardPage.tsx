import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  MessageSquare,
  CheckCircle2,
  Star,
  Users,
  AlertCircle,
  X
} from 'lucide-react'

// Layout/Dashboard Components
import { TopBar } from '../components/dashboard/top-bar'
import { StatCard } from '../components/dashboard/stat-card'
import { FormTable } from '../components/dashboard/form-table'
import { CreateFormModal } from '../components/dashboard/create-form-modal'
import { DeleteConfirmModal } from '../components/dashboard/delete-confirm-modal'
import { BulkDeleteModal } from '../components/dashboard/bulk-delete-modal'
import { ShareModal } from '../components/dashboard/share-modal'
import { authClient } from '../lib/auth-client'
import {
  useForms,
  useDeleteForm,
  useToggleFormStatus,
  useDuplicateForm,
  useBatchToggleStatus,
  useBatchDeleteForms,
} from '../hooks/useForms'
import { useDashboardStats } from '../hooks/useDashboardStats'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  // Modal state (UI only — not data)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = useState<string[] | null>(null)
  const [sharingFormId, setSharingFormId] = useState<string | null>(null)
  const [showCreateSuccess, setShowCreateSuccess] = useState(false)

  // Data fetching
  const { data: forms = [], isLoading } = useForms()
  const { data: stats = { totalReviews: 0, completionRate: 0, averageRating: 0, uniqueRespondents: 0 } } = useDashboardStats()

  // Mutations
  const deleteForm = useDeleteForm()
  const toggleStatus = useToggleFormStatus()
  const duplicateForm = useDuplicateForm()
  const batchToggle = useBatchToggleStatus()
  const batchDelete = useBatchDeleteForms()

  // Derived error: surface the most recent mutation error
  const mutationError =
    deleteForm.error?.message ??
    toggleStatus.error?.message ??
    duplicateForm.error?.message ??
    batchToggle.error?.message ??
    batchDelete.error?.message ??
    null

  const clearError = useCallback(() => {
    deleteForm.reset()
    toggleStatus.reset()
    duplicateForm.reset()
    batchToggle.reset()
    batchDelete.reset()
  }, [deleteForm, toggleStatus, duplicateForm, batchToggle, batchDelete])

  const confirmDelete = useCallback(async () => {
    if (!deletingFormId) return
    await deleteForm.mutateAsync(deletingFormId)
    setDeletingFormId(null)
  }, [deletingFormId, deleteForm])

  const confirmBulkDelete = useCallback(async () => {
    if (!bulkDeletingIds) return
    await batchDelete.mutateAsync(bulkDeletingIds)
    setBulkDeletingIds(null)
  }, [bulkDeletingIds, batchDelete])

  const handleBatchToggleStatus = useCallback(
    (ids: string[], isActive: boolean) => batchToggle.mutate({ ids, isActive }),
    [batchToggle]
  )

  const userName = session?.user?.name?.split(' ')[0] || 'User'
  const isDeleting = deleteForm.isPending || batchDelete.isPending

  const deltaLabel = (value?: number) => {
    if (value === undefined) return '—'
    if (value > 0) return `↑ +${value}%`
    if (value < 0) return `↓ ${value}%`
    return '0%'
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="max-w-285 mx-auto px-6 py-12 pb-20 relative z-10">
        <div className="mb-10">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-(--v3-teal) mb-2.5 block">
            // dashboard
          </span>
          <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tighter text-(--v3-text) leading-[1.1] mb-2">
            Hello, {userName} 👋
          </h1>
          <p className="text-[15px] text-(--v3-muted2)">Overview of your reviews platform.</p>
        </div>

        {mutationError && (
          <div className="mb-8 p-4 bg-(--v3-red-dim) border border-(--v3-red)/20 rounded-2xl flex items-center justify-between group animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-(--v3-red)/10 flex items-center justify-center text-(--v3-red)">
                <AlertCircle size={16} />
              </div>
              <p className="text-sm font-medium text-(--v3-red)">{mutationError}</p>
            </div>
            <button
              onClick={clearError}
              className="text-(--v3-red)/50 hover:text-(--v3-red) transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <StatCard
            icon={<MessageSquare size={18} />}
            label="Total reviews"
            value={stats.totalReviews.toString()}
            delta={deltaLabel(stats.reviewsGrowth)}
            colorClass="bg-(--v3-teal-dim) border-(--v3-teal)/20 text-(--v3-teal)"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completion rate"
            value={`${stats.completionRate}%`}
            delta={deltaLabel(stats.completionGrowth)}
            colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          />
          <StatCard
            icon={<Star size={18} />}
            label="Average rating"
            value={stats.averageRating.toFixed(1)}
            colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Unique respondents"
            value={stats.uniqueRespondents.toString()}
            delta="—"
            colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500"
          />
        </div>

        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-(--v3-teal)">// my forms</span>
            <span className="text-[11px] font-semibold bg-(--v3-bg3) border border-(--v3-border2) text-(--v3-muted2) px-2.5 py-0.5 rounded-full">
              {forms.length} forms
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-(--v3-teal) text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={14} strokeWidth={2.5} />
            Add form
          </button>
        </div>

        <div className="mb-20">
          {isLoading ? (
            <div className="py-20 text-center text-(--v3-muted) italic">Loading...</div>
          ) : forms.length > 0 ? (
            <FormTable
              forms={forms}
              onReorder={() => {}}
              onOpenForm={(id) => navigate(`/forms/${id}`)}
              onDeleteForm={setDeletingFormId}
              onToggleFormStatus={(id) => toggleStatus.mutate(id)}
              onDuplicateForm={(id) => duplicateForm.mutate(id)}
              onShareForm={setSharingFormId}
              onBatchToggleStatus={handleBatchToggleStatus}
              onBulkDelete={setBulkDeletingIds}
              onEditForm={(id) => navigate(`/forms/${id}/edit`)}
            />
          ) : (
            <div className="py-20 bg-(--v3-bg2) border border-dashed border-(--v3-border2) rounded-2xl text-center">
              <p className="text-(--v3-muted) mb-4">You don't have any forms yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-(--v3-teal) font-bold hover:underline"
              >
                Create your first form
              </button>
            </div>
          )}
        </div>
      </main>

      <CreateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setShowCreateSuccess(true)
          setTimeout(() => setShowCreateSuccess(false), 3000)
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFormId}
        onClose={() => setDeletingFormId(null)}
        onConfirm={confirmDelete}
        formName={forms.find((f) => f.id === deletingFormId)?.name ?? ''}
        loading={isDeleting}
      />

      <BulkDeleteModal
        isOpen={!!bulkDeletingIds}
        onClose={() => setBulkDeletingIds(null)}
        onConfirm={confirmBulkDelete}
        count={bulkDeletingIds?.length ?? 0}
        loading={isDeleting}
      />

      <ShareModal
        isOpen={!!sharingFormId}
        onClose={() => setSharingFormId(null)}
        formName={forms.find((f) => f.id === sharingFormId)?.name ?? ''}
        formSlug={forms.find((f) => f.id === sharingFormId)?.slug ?? ''}
        publicId={forms.find((f) => f.id === sharingFormId)?.publicId ?? ''}
      />

      {showCreateSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-(--v3-teal) text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-9999">
          <CheckCircle2 size={20} className="text-white" />
          <span className="font-bold text-sm">Form created successfully!</span>
        </div>
      )}
    </div>
  )
}
