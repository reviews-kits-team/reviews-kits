import { useState } from 'react';
import { X, Copy, Check, Globe, Twitter, Linkedin, Facebook, FileText } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formName: string;
  formSlug: string;
  publicId: string;
}

export const ShareModal = ({ isOpen, onClose, formName, formSlug, publicId }: ShareModalProps) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/f/${formSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(publicId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const shareSocial = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const text = `Check out my form: ${formName}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-[var(--v3-text)]">
              Share form
            </h2>
            <button onClick={onClose} className="p-2 text-[var(--v3-muted2)] hover:text-[var(--v3-text)] hover:bg-white/5 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Direct Link */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-[var(--v3-teal)]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-muted2)]">Direct link</span>
              </div>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-[var(--v3-muted2)] focus:outline-none focus:border-[var(--v3-teal)]/30 transition-all font-mono"
                />
                <button 
                  onClick={copyLink}
                  className={`px-4 rounded-xl flex items-center gap-2 font-bold text-xs uppercase transition-all ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-[var(--v3-teal)] text-white hover:shadow-[0_8px_20px_rgba(45,212,191,0.2)]'}`}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Form ID for API */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-muted2)]">Form ID (API)</span>
              </div>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={publicId}
                  className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-[var(--v3-muted2)] focus:outline-none focus:border-purple-500/30 transition-all font-mono"
                />
                <button 
                  onClick={copyId}
                  className={`px-4 rounded-xl flex items-center gap-2 font-bold text-xs uppercase transition-all ${copiedId ? 'bg-emerald-500 text-white' : 'bg-purple-600/80 text-white hover:bg-purple-600 hover:shadow-[0_8px_20px_rgba(147,51,234,0.2)]'}`}
                >
                  {copiedId ? <Check size={16} /> : <Copy size={16} />}
                  {copiedId ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[var(--v3-muted2)] italic">
                Use this ID for your public API requests.
              </p>
            </div>

            {/* Social Sharing */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--v3-muted2)] block mb-4">Share on networks</span>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => shareSocial('twitter')}
                  className="flex items-center justify-center py-3.5 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all shadow-sm"
                  title="Twitter / X"
                >
                  <Twitter size={20} />
                </button>
                <button 
                  onClick={() => shareSocial('linkedin')}
                  className="flex items-center justify-center py-3.5 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] hover:bg-[#0077b5]/20 transition-all shadow-sm"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </button>
                <button 
                  onClick={() => shareSocial('facebook')}
                  className="flex items-center justify-center py-3.5 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all shadow-sm"
                  title="Facebook"
                >
                  <Facebook size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
