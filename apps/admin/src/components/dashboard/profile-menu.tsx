import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Settings,
  LogOut,
  Key,
  Copy,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Check
} from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { useApiKeys, useRotateApiKeys } from '../../hooks/useApiKeys'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileMenu = ({ isOpen, onClose }: ProfileMenuProps) => {
  const { data: session } = authClient.useSession()
  const [showSecret, setShowSecret] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [copiedKey, setCopiedKey] = useState<'public' | 'secret' | null>(null)

  const { data: apiKeys, isLoading: loadingKeys } = useApiKeys(isOpen)
  const rotateKeys = useRotateApiKeys()

  const copyToClipboard = (text: string, type: 'public' | 'secret') => {
    navigator.clipboard.writeText(text)
    setCopiedKey(type)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleRotateKeys = () => {
    if (!confirm("Regenerate your keys? Old ones will become invalid.")) return
    rotateKeys.mutate()
  }

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-(--v3-bg2) border border-(--v3-border) rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15),0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden z-300 animate-in fade-in zoom-in-95 duration-200 origin-top-right" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="p-5 border-b border-(--v3-border) bg-(--v3-bg3)/40">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-(--v3-teal) to-[#0a6e52] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-(--v3-text) truncate">{session?.user?.name}</div>
            <div className="text-[10px] text-(--v3-muted2) truncate">{session?.user?.email}</div>
          </div>
        </div>
      </div>

      <div className="py-2">
        <div className="h-px bg-(--v3-border) mx-4 my-2 opacity-50" />

        <div className="px-2 space-y-0.5">
          <Link
            to="/profile"
            onClick={onClose}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-(--v3-text) hover:bg-(--v3-border) transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2) group-hover:text-(--v3-teal) transition-colors">
                <User size={16} />
              </div>
              My Profile
            </div>
            <ChevronRight size={14} className="text-(--v3-muted)" />
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-(--v3-text) hover:bg-(--v3-border) transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2) group-hover:text-(--v3-teal) transition-colors">
                <Settings size={16} />
              </div>
              Settings
            </div>
            <ChevronRight size={14} className="text-(--v3-muted)" />
          </Link>

          {/* API Keys Item */}
          <div className="space-y-1">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group ${showApiKeys ? 'bg-(--v3-border) text-(--v3-teal)' : 'text-(--v3-text) hover:bg-(--v3-border)'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center transition-colors ${showApiKeys ? 'text-(--v3-teal)' : 'text-(--v3-muted2) group-hover:text-(--v3-teal)'}`}>
                  <Key size={16} />
                </div>
                API Keys
              </div>
              <div className="flex items-center gap-2">
                {loadingKeys && <RefreshCw size={10} className="animate-spin text-(--v3-muted2)" />}
                <ChevronRight size={14} className={`text-(--v3-muted) transition-transform duration-200 ${showApiKeys ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {showApiKeys && (
              <div className="px-3 pb-2 pt-1 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-(--v3-bg) border border-(--v3-border) rounded-lg p-2.5 flex items-center justify-between group/key">
                  <div className="min-w-0 pr-2">
                    <div className="text-[8px] font-bold text-(--v3-muted2) uppercase mb-0.5">Public Key</div>
                    <div className="text-[10px] font-mono text-(--v3-text) truncate opacity-60 group-hover/key:opacity-100 transition-opacity">
                      {apiKeys?.publicKey || 'rk_pk_live_...'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (apiKeys) copyToClipboard(apiKeys.publicKey, 'public') }}
                    className={`p-1.5 rounded-md transition-all ${copiedKey === 'public' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-(--v3-border) text-(--v3-muted2) hover:text-(--v3-teal)'}`}
                  >
                    {copiedKey === 'public' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="bg-(--v3-bg) border border-(--v3-border) rounded-lg p-2.5 flex items-center justify-between group/key">
                  <div className="min-w-0 pr-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowSecret(!showSecret) }}>
                    <div className="text-[8px] font-bold text-rose-400 uppercase mb-0.5">Secret Key</div>
                    <div className="text-[10px] font-mono text-(--v3-text) truncate opacity-60 group-hover/key:opacity-100 transition-opacity">
                      {showSecret ? (apiKeys?.secretKey || 'rk_sk_...') : '••••••••••••••••'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (apiKeys) copyToClipboard(apiKeys.secretKey, 'secret') }}
                      className={`p-1.5 rounded-md transition-all ${copiedKey === 'secret' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-(--v3-border) text-(--v3-muted2) hover:text-rose-400'}`}
                    >
                      {copiedKey === 'secret' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRotateKeys() }}
                      className="p-1.5 hover:bg-(--v3-border) rounded-md text-(--v3-muted2) hover:text-(--v3-teal) transition-all"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-(--v3-border) mx-4 my-2" />

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
      <div className="p-4 bg-(--v3-bg3)/60 flex items-center justify-between">
        <span className="text-[10px] font-bold text-(--v3-muted2) opacity-50 uppercase tracking-widest">v1.2.0</span>
        <a href="#" className="text-[10px] font-bold text-(--v3-teal) hover:underline flex items-center gap-1">
          Docs <ExternalLink size={10} />
        </a>
      </div>
    </div>
  )
}
