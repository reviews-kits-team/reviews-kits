import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  Users
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
  const [stats, setStats] = useState({
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
    setDeletingFormId(id);
  };

  const confirmDelete = async () => {
    if (!deletingFormId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/forms/${deletingFormId}`, { method: 'DELETE' });
      if (res.ok) {
        setForms(forms.filter(f => f.id !== deletingFormId));
        setDeletingFormId(null);
      }
    } catch (error) {
      console.error("Failed to delete form", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFormStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/forms/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updatedForm = await res.json();
        setForms(forms.map(f => f.id === id ? { ...f, isActive: updatedForm.isActive } : f));
      }
    } catch (error) {
      console.error("Failed to toggle form status", error);
    }
  };

  const handleDuplicateForm = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/forms/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const newForm = await res.json();
        setForms([newForm, ...forms]);
      }
    } catch (error) {
      console.error("Failed to duplicate form", error);
    }
  };

  const handleEditForm = (id: string) => {
    navigate(`/forms/${id}/edit`);
  };

  const handleBatchToggleStatus = async (ids: string[], isActive: boolean) => {
    try {
      const res = await fetch('/api/v1/forms/batch-toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isActive })
      });
      
      if (res.ok) {
        setForms(forms.map(f => ids.includes(f.id) ? { ...f, isActive } : f));
      }
    } catch (error) {
      console.error("Failed to batch toggle forms status", error);
    }
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeletingIds) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/v1/forms/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bulkDeletingIds })
      });
      
      if (res.ok) {
        setForms(forms.filter(f => !bulkDeletingIds.includes(f.id)));
        setBulkDeletingIds(null);
      }
    } catch (error) {
      console.error("Failed to batch delete forms", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = session?.user?.name?.split(' ')[0] || 'Utilisateur'

  return (
    <div className="min-h-screen">
      <TopBar />
      
      {selectedFormId && selectedForm ? (
        <DetailView 
          form={selectedForm} 
          onBack={() => setSelectedFormId(null)} 
          onShare={setSharingFormId}
        />
      ) : (
        <main className="max-w-[1140px] mx-auto px-6 py-12 pb-20 relative z-10">
          <div className="mb-10">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)] mb-2.5 block">
              // dashboard
            </span>
            <h1 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-tighter text-[var(--v3-text)] leading-[1.1] mb-2">
              Bonjour, {userName} 👋
            </h1>
            <p className="text-[15px] text-[var(--v3-muted2)]">Vue d'ensemble de ta plateforme de reviews.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            <StatCard 
              icon={<MessageSquare size={18} />} 
              label="Total reviews" 
              value={stats.totalReviews.toString()} 
              delta="↑ 0%" 
              colorClass="bg-[var(--v3-teal-dim)] border-[var(--v3-teal)]/20 text-[var(--v3-teal)]" 
            />
            <StatCard 
              icon={<CheckCircle2 size={18} />} 
              label="Taux de complétion" 
              value={`${stats.completionRate}%`} 
              delta="↑ 0%" 
              colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
            />
            <StatCard 
              icon={<Star size={18} />} 
              label="Note moyenne" 
              value={stats.averageRating.toFixed(1)} 
              colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500" 
            />
            <StatCard 
              icon={<Users size={18} />} 
              label="Répondants uniques" 
              value={stats.uniqueRespondents.toString()} 
              delta="↑ 0%" 
              colorClass="bg-sky-500/10 border-sky-500/20 text-sky-500" 
            />
          </div>

          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--v3-teal)]">// mes formulaires</span>
              <span className="text-[11px] font-semibold bg-[var(--v3-bg3)] border border-[var(--v3-border2)] text-[var(--v3-muted2)] px-2.5 py-0.5 rounded-full">
                {forms.length} formulaires
              </span>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--v3-teal)] text-white px-5.5 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--v3-teal-glow)] transition-all overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus size={14} strokeWidth={2.5} />
              Ajouter un formulaire
            </button>
          </div>

          <div className="mb-20">
            {loading ? (
              <div className="py-20 text-center text-[var(--v3-muted)] italic">Chargement...</div>
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
              <div className="py-20 bg-[var(--v3-bg2)] border border-dashed border-white/5 rounded-2xl text-center">
                <p className="text-[var(--v3-muted)] mb-4">Tu n'as pas encore de formulaire.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-[var(--v3-teal)] font-bold hover:underline"
                >
                  Créer ton premier formulaire
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      <CreateFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={(newForm) => setForms([newForm, ...forms])}
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
    </div>
  )
}
