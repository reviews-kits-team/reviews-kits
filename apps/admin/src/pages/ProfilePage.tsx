import { useState } from 'react'
import { SettingsLayout } from '../components/dashboard/settings-layout'
import { authClient } from '../lib/auth-client'
import { Camera, Mail, User as UserIcon, Loader2, Check, CheckCircle, Lock } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, refetch } = authClient.useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleSave = async () => {
    setIsUpdating(true)
    setUpdateSuccess(false)
    try {
      const res = await fetch('/api/v1/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      })

      if (res.ok) {
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 3000)
        // Refresh session data to update TopBar and other components instantly
        await refetch()
      }
    } catch (error) {
      console.error("Failed to update profile", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters")
        return
    }

    setIsPasswordUpdating(true)
    setPasswordError('')
    setPasswordSuccess(false)

    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        setPasswordError(error.message || "Failed to update password")
      } else {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
            setPasswordError(err.message)
        } else {
            setPasswordError("An unexpected error occurred")
        }
    } finally {
        setIsPasswordUpdating(false)
    }
  }

  return (
    <SettingsLayout 
      title="My Profile" 
      subtitle="Manage your personal information and visual identity."
    >
      <div className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-[var(--v3-bg2)] border border-[var(--v3-border)] rounded-2xl p-6 relative overflow-hidden group">
           <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--v3-teal)] to-[#0a6e52] flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--v3-bg3)] border border-[var(--v3-border)] flex items-center justify-center text-[var(--v3-muted2)] hover:text-[var(--v3-teal)] transition-all shadow-lg">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-[var(--v3-text)] text-lg">Profile picture</h3>
                <p className="text-xs text-[var(--v3-muted2)] mt-1">Click on the icon to modify your avatar.</p>
              </div>
           </div>
        </section>

        {/* Basic Info Form */}
        <section className="space-y-6">
           <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                    <UserIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                    placeholder="Your name..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                    placeholder="Your email..."
                  />
                </div>
              </div>
           </div>

           <button 
             onClick={handleSave}
             disabled={isUpdating || !name || !email || (name === session?.user?.name && email === session?.user?.email)}
             className="w-full py-3.5 bg-[var(--v3-teal)] text-white rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
           >
             {isUpdating ? <Loader2 className="animate-spin" size={18} /> : updateSuccess ? <Check size={18} /> : null}
             {isUpdating ? 'Saving...' : updateSuccess ? 'Saved!' : 'Save changes'}
           </button>
        </section>

        {/* Security Section */}
        <section className="space-y-6 pt-8 border-t border-[var(--v3-border)]">
           <div className="flex flex-col gap-1 ml-1">
             <h3 className="text-sm font-bold text-[var(--v3-text)]">Security</h3>
             <p className="text-[10px] text-[var(--v3-muted2)] uppercase tracking-widest font-black">Change your password</p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Current Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">New Password</label>
                    <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                        <Lock size={16} />
                    </div>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                        placeholder="Min. 8 characters"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[var(--v3-teal)] ml-1">Confirm New Password</label>
                    <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v3-muted)] group-focus-within:text-[var(--v3-teal)] transition-colors">
                        <Lock size={16} />
                    </div>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[var(--v3-bg2)] border border-[var(--v3-border)] focus:border-[var(--v3-teal)]/50 rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--v3-text)] outline-none transition-all focus:ring-4 focus:ring-[var(--v3-teal)]/5"
                        placeholder="Confirm password..."
                    />
                    </div>
                </div>
              </div>
           </div>

           {passwordError && (
             <div className="bg-[var(--v3-red)]/10 border border-[var(--v3-red)]/20 text-[var(--v3-red)] px-4 py-2.5 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {passwordError}
             </div>
           )}

           <button 
             onClick={handlePasswordUpdate}
             disabled={isPasswordUpdating || !currentPassword || !newPassword || !confirmPassword}
             className="w-full py-3.5 bg-[var(--v3-bg3)] border border-[var(--v3-border)] text-[var(--v3-text)] hover:border-[var(--v3-teal)]/50 hover:bg-[var(--v3-bg3)]/80 rounded-xl font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
           >
             {isPasswordUpdating ? <Loader2 className="animate-spin" size={18} /> : passwordSuccess ? <Check size={18} /> : null}
             {isPasswordUpdating ? 'Updating...' : passwordSuccess ? 'Updated!' : 'Update password'}
           </button>
        </section>
      </div>
      {/* Toast Notification */}
      {(updateSuccess || passwordSuccess) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--v3-teal)] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-[9999]">
          <CheckCircle size={20} className="text-white" />
          <span className="font-bold text-sm">{updateSuccess ? 'Profile updated!' : 'Password updated!'}</span>
        </div>
      )}
    </SettingsLayout>
  )
}
