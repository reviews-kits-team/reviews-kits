import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  loading?: boolean;
}

export const BulkDeleteModal = ({ isOpen, onClose, onConfirm, count, loading }: BulkDeleteModalProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const REQUIRED_TEXT = 'supprimer la sélection';

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmationText === REQUIRED_TEXT) {
      onConfirm();
      setConfirmationText('');
    }
  };

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
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 size={24} />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-xl font-black tracking-tight text-[var(--v3-text)] mb-3">
            Supprimer la sélection ?
          </h2>
          <p className="text-[var(--v3-muted2)] text-sm leading-relaxed mb-6">
            Tu es sur le point de supprimer <span className="text-rose-400 font-bold">{count} formulaires</span>.
            Cette action est irréversible. Pour confirmer, tape <span className="text-[var(--v3-text)] font-mono font-bold select-none cursor-default bg-white/5 px-1.5 py-0.5 rounded">"{REQUIRED_TEXT}"</span> ci-dessous :
          </p>

          <div className="mb-8">
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Tape la phrase de confirmation..."
              className="w-full bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-xl px-4 py-3 text-sm text-[var(--v3-text)] placeholder:text-[var(--v3-muted2)] focus:outline-none focus:border-rose-500/50 transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--v3-muted2)] hover:text-[var(--v3-text)] bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || confirmationText !== REQUIRED_TEXT}
              className="flex-1 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
