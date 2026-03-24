import { useState, useEffect, useMemo } from 'react'
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
import { DetailView } from '../components/dashboard/detail-view'
import { CreateFormModal } from '../components/dashboard/create-form-modal'
import { DeleteConfirmModal } from '../components/dashboard/delete-confirm-modal'
import { BulkDeleteModal } from '../components/dashboard/bulk-delete-modal'
import { ShareModal } from '../components/dashboard/share-modal'
import type { DashboardForm } from '../components/dashboard/types'
import { authClient } from '../lib/auth-client'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [forms, setForms] = useState<DashboardForm[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = useState<string[] | null>(null)
  const [sharingFormId, setSharingFormId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateSuccess, setShowCreateSuccess] = useState(false)
  const [stats, setStats] = useState<{
    totalReviews: number;
    completionRate: number;
    averageRating: number;
    uniqueRespondents: number;
    reviewsGrowth?: number;
    completionGrowth?: number;
  }>({
    totalReviews: 0,
    completionRate: 0,
    averageRating: 0.0,
    uniqueRespondents: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/forms');
        if (res.ok) setForms(await res.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/dashboard/stats');
        if (res.ok) setStats(await res.json());
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchData();
    fetchStats();
  }, [])

  const selectedForm = useMemo(() =>
    forms.find(f => f.id === selectedFormId), [selectedFormId, forms]
  )

  const handleDeleteForm = (id: string) => {
    setError(null);
    setDeletingFormId(id);
  };

  const confirmDelete = async () => {
    if (!deletingFormId) return;

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/forms/${deletingFormId}`, { method: 'DELETE' });
      if (res.ok) {
        setForms(forms.filter(f => f.id !== deletingFormId));
        setDeletingFormId(null);
      } else {
        const data = await res.json();
        setError(data.error?.message || "Failed to delete form. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete form", error);
      setError("A network error occurred. Please check your connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFormStatus = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/forms/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updatedForm = await res.json();
        setForms(forms.map(f => f.id === id ? { ...f, isActive: updatedForm.isActive } : f));
      } else {
        setError("Failed to update form status.");
      }
    } catch (error) {
      console.error("Failed to toggle form status", error);
      setError("Network error while updating form status.");
    }
  };

  const handleDuplicateForm = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/forms/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const newForm = await res.json();
        setForms([newForm, ...forms]);
      } else {
        setError("Failed to duplicate form.");
      }
    } catch (error) {
      console.error("Failed to duplicate form", error);
      setError("Network error while duplicating form.");
    }
  };

  const handleEditForm = (id: string) => {
    navigate(`/forms/${id}/edit`);
  };

  const handleBatchToggleStatus = async (ids: string[], isActive: boolean) => {
    setError(null);
    try {
      const res = await fetch('/api/v1/forms/batch-toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isActive })
      });

      if (res.ok) {
        setForms(forms.map(f => ids.includes(f.id) ? { ...f, isActive } : f));
      } else {
        setError("Failed to update multiple forms.");
      }
    } catch (error) {
      console.error("Failed to batch toggle forms status", error);
      setError("Network error during batch update.");
    }
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeletingIds) return;

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/forms/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkDeletingIds })
      });

      if (res.ok) {
        setForms(forms.filter(f => !bulkDeletingIds.includes(f.id)));
        setBulkDeletingIds(null);
      } else {
        const data = await res.json();
        setError(data.error?.message || "Failed to delete selected forms.");
      }
    } catch (error) {
      console.error("Failed to batch delete forms", error);
      setError("Network error during bulk deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = session?.user?.name?.split(' ')[0] || 'User'

  return (
    <div className="min-h-screen">
      <TopBar />

      {selectedFormId && selectedForm ? (
        <DetailView
          form={selectedForm}
          onBack={() => setSelectedFormId(null)}
        />
      ) : (
        <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
          <div className="mb-10">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
              // dashboard
            </span>
            <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tighter text-[var(--v3-text)] leading-[1.1] mb-2">
              Hello, {userName} 👋
            </h1>
            <p className="text-[15px] text-[var(--v3-muted2)]">Overview of your reviews platform.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-[var(--v3-red-dim)] border border-[var(--v3-red)]/20 rounded-2xl flex items-center justify-between group animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--v3-red)]/10 flex items-center justify-center text-[var(--v3-red)]">
                  <AlertCircle size={16} />
                </div>
                <p className="text-sm font-medium text-[var(--v3-red)]">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-[var(--v3-red)]/50 hover:text-[var(--v3-red)] transition-colors p-1"
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
              delta={stats.reviewsGrowth !== undefined ? (stats.reviewsGrowth > 0 ? `↑ +${stats.reviewsGrowth}%` : stats.reviewsGrowth < 0 ? `↓ ${stats.reviewsGrowth}%` : "0%") : "—"}
              colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]"
            />
            <StatCard
              icon={<CheckCircle2 size={18} />}
              label="Completion rate"
              value={`${stats.completionRate}%`}
              delta={stats.completionGrowth !== undefined ? (stats.completionGrowth > 0 ? `↑ +${stats.completionGrowth}%` : stats.completionGrowth < 0 ? `↓ ${stats.completionGrowth}%` : "0%") : "—"}
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
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)]">// my forms</span>
              <span className="text-[11px] font-semibold bg-[var(--v3-bg3)] border border-[var(--v3-border2)] text-[var(--v3-muted2)] px-2.5 py-0.5 rounded-full">
                {forms.length} forms
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus size={14} strokeWidth={2.5} />
              Add form
            </button>
          </div>

          <div className="mb-20">
            {loading ? (
              <div className="py-20 text-center text-[var(--v3-muted)] italic">Loading...</div>
            ) : forms.length > 0 ? (
              <FormTable
                forms={forms}
                onReorder={setForms}
                onOpenForm={setSelectedFormId}
                onDeleteForm={handleDeleteForm}
                onToggleFormStatus={handleToggleFormStatus}
                onDuplicateForm={handleDuplicateForm}
                onShareForm={setSharingFormId}
                onBatchToggleStatus={handleBatchToggleStatus}
                onBulkDelete={setBulkDeletingIds}
                onEditForm={handleEditForm}
              />
            ) : (
              <div className="py-20 bg-[var(--v3-bg2)] border border-dashed border-[var(--v3-border2)] rounded-2xl text-center">
                <p className="text-[var(--v3-muted)] mb-4">You don't have any forms yet.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[var(--v3-teal)] font-bold hover:underline"
                >
                  Create your first form
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      <CreateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newForm) => {
          setForms([newForm, ...forms])
          setShowCreateSuccess(true)
          setTimeout(() => setShowCreateSuccess(false), 3000)
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFormId}
        onClose={() => setDeletingFormId(null)}
        onConfirm={confirmDelete}
        formName={forms.find(f => f.id === deletingFormId)?.name || ''}
        loading={isDeleting}
      />

      <BulkDeleteModal
        isOpen={!!bulkDeletingIds}
        onClose={() => setBulkDeletingIds(null)}
        onConfirm={confirmBulkDelete}
        count={bulkDeletingIds?.length || 0}
        loading={isDeleting}
      />

      <ShareModal
        isOpen={!!sharingFormId}
        onClose={() => setSharingFormId(null)}
        formName={forms.find(f => f.id === sharingFormId)?.name || ''}
        formSlug={forms.find(f => f.id === sharingFormId)?.slug || ''}
        publicId={forms.find(f => f.id === sharingFormId)?.publicId || ''}
      />

      {/* Toast Notification */}
      {showCreateSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--v3-teal)] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-[9999]">
          <CheckCircle2 size={20} className="text-white" />
          <span className="font-bold text-sm">Form created successfully!</span>
        </div>
      )}
    </div>
  )
}
