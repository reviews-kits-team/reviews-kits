import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, 
  Settings, 
  LogOut, 
  Key, 
  Copy, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Check
} from 'lucide-react'
import { authClient } from '../../lib/auth-client'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface ApiKeys {
  publicKey: string
  secretKey: string
}

export const ProfileMenu = ({ isOpen, onClose }: ProfileMenuProps) => {
  const { data: session } = authClient.useSession()
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [copiedKey, setCopiedKey] = useState<'public' | 'secret' | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchApiKeys()
    }
  }, [isOpen])

  const fetchApiKeys = async () => {
    setLoadingKeys(true)
    try {
      const res = await fetch('/api/v1/api-keys')
      if (res.ok) setApiKeys(await res.json())
    } catch (error) {
      console.error("Failed to fetch keys", error)
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleRotateKeys = async () => {
    if (!confirm("Regenerate your keys? Old ones will become invalid.")) return
    try {
      const res = await fetch('/api/v1/api-keys/rotate', { method: 'POST' })
      if (res.ok) setApiKeys(await res.json())
    } catch (error) {
      console.error("Failed to rotate keys", error)
    }
  }

  const copyToClipboard = (text: string, type: 'public' | 'secret') => {
    navigator.clipboard.writeText(text)
    setCopiedKey(type)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[250]" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden z-[300] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        {/* Header */}
        <div className="p-5 border-b border-[var(--v3-border)] bg-white/[0.02]">
           <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--v3-teal)] to-[#0a6e52] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[var(--v3-text)] truncate">{session?.user?.name}</div>
                <div className="text-[10px] text-[var(--v3-muted2)] truncate">{session?.user?.email}</div>
              </div>
           </div>
        </div>

        <div className="py-2">
          <div className="h-px bg-[var(--v3-border)] mx-4 my-2 opacity-50" />

          {/* Menu Items */}
          <div className="px-2 space-y-0.5">
            <Link 
              to="/profile" 
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--v3-text)] hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--v3-muted2)] group-hover:text-[var(--v3-teal)] transition-colors">
                  <User size={16} />
                </div>
                My Profile
              </div>
              <ChevronRight size={14} className="text-[var(--v3-muted)]" />
            </Link>

            <Link 
              to="/settings" 
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--v3-text)] hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--v3-muted2)] group-hover:text-[var(--v3-teal)] transition-colors">
                  <Settings size={16} />
                </div>
                Settings
              </div>
              <ChevronRight size={14} className="text-[var(--v3-muted)]" />
            </Link>

            <Link 
              to="/security" 
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--v3-text)] hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--v3-muted2)] group-hover:text-[var(--v3-teal)] transition-colors">
                  <ShieldCheck size={16} />
                </div>
                Security
              </div>
              <ChevronRight size={14} className="text-[var(--v3-muted)]" />
            </Link>

            {/* API Keys Item */}
            <div className="space-y-1">
              <button 
                onClick={() => setShowApiKeys(!showApiKeys)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${showApiKeys ? 'bg-white/[0.04] text-[var(--v3-teal)]' : 'text-[var(--v3-text)] hover:bg-white/[0.04]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center transition-colors ${showApiKeys ? 'text-[var(--v3-teal)]' : 'text-[var(--v3-muted2)] group-hover:text-[var(--v3-teal)]'}`}>
                    <Key size={16} />
                  </div>
                  API Keys
                </div>
                <div className="flex items-center gap-2">
                  {loadingKeys && <RefreshCw size={10} className="animate-spin text-[var(--v3-muted2)]" />}
                  <ChevronRight size={14} className={`text-[var(--v3-muted)] transition-transform duration-200 ${showApiKeys ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {showApiKeys && (
                <div className="px-3 pb-2 pt-1 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg p-2.5 flex items-center justify-between group/key">
                    <div className="min-w-0 pr-2">
                        <div className="text-[8px] font-bold text-[var(--v3-muted2)] uppercase mb-0.5">Public Key</div>
                        <div className="text-[10px] font-mono text-[var(--v3-text)] truncate opacity-60 group-hover/key:opacity-100 transition-opacity">
                          {apiKeys?.publicKey || 'rk_pk_live_...'}
                        </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (apiKeys) copyToClipboard(apiKeys.publicKey, 'public'); }}
                      className={`p-1.5 rounded-md transition-all ${copiedKey === 'public' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5 text-[var(--v3-muted2)] hover:text-[var(--v3-teal)]'}`}
                    >
                      {copiedKey === 'public' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="bg-[var(--v3-bg)] border border-[var(--v3-border)] rounded-lg p-2.5 flex items-center justify-between group/key">
                    <div className="min-w-0 pr-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowSecret(!showSecret); }}>
                        <div className="text-[8px] font-bold text-rose-400 uppercase mb-0.5">Secret Key</div>
                        <div className="text-[10px] font-mono text-[var(--v3-text)] truncate opacity-60 group-hover/key:opacity-100 transition-opacity">
                          {showSecret ? (apiKeys?.secretKey || 'rk_sk_...') : '••••••••••••••••'}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (apiKeys) copyToClipboard(apiKeys.secretKey, 'secret'); }}
                          className={`p-1.5 rounded-md transition-all ${copiedKey === 'secret' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5 text-[var(--v3-muted2)] hover:text-rose-400'}`}
                        >
                          {copiedKey === 'secret' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRotateKeys(); }}
                          className="p-1.5 hover:bg-white/5 rounded-md text-[var(--v3-muted2)] hover:text-[var(--v3-teal)] transition-all"
                        >
                          <RefreshCw size={12} />
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[var(--v3-border)] mx-4 my-2" />

          <div className="px-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/5 flex items-center justify-center">
                <LogOut size={16} />
              </div>
              Logout
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-black/20 flex items-center justify-between">
           <span className="text-[10px] font-bold text-[var(--v3-muted2)] opacity-50 uppercase tracking-widest">v1.2.0</span>
           <a href="#" className="text-[10px] font-bold text-[var(--v3-teal)] hover:underline flex items-center gap-1">
              Docs <ExternalLink size={10} />
           </a>
        </div>
      </div>
    </>
  )
}
