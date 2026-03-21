import { AlertCircle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formName: string;
  loading?: boolean;
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, formName, loading }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
              <AlertCircle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-xl font-black tracking-tight text-[var(--v3-text)] mb-3">
            Supprimer ce formulaire ?
          </h2>
          <p className="text-[var(--v3-muted2)] text-sm leading-relaxed mb-8">
            Es-tu sûr de vouloir supprimer <span className="text-[var(--v3-text)] font-bold">"{formName}"</span> ? 
            Cette action est irréversible et supprimera également tous les témoignages associés.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--v3-muted2)] hover:text-[var(--v3-text)] bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all disabled:opacity-50"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
