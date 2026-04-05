import { useState } from 'react'
import { SettingsLayout } from '../components/dashboard/settings-layout'
import { authClient } from '../lib/auth-client'
import { Camera, Mail, User as UserIcon, Loader2, Check, CheckCircle, Lock } from 'lucide-react'
import { useUpdateProfile } from '../hooks/useMe'

export default function ProfilePage() {
  const { data: session, refetch } = authClient.useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const updateProfile = useUpdateProfile(async () => {
    setUpdateSuccess(true)
    setTimeout(() => setUpdateSuccess(false), 3000)
    await refetch()
  })

  const handleSave = () => {
    updateProfile.mutate({ name, email })
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
      setPasswordError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsPasswordUpdating(false)
    }
  }

  const isUpdating = updateProfile.isPending

  return (
    <SettingsLayout
      title="My Profile"
      subtitle="Manage your personal information and visual identity."
    >
      <div className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-6 relative overflow-hidden group">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-(--v3-teal) to-[#0a6e52] flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2) hover:text-(--v3-teal) transition-all shadow-lg">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-(--v3-text) text-lg">Profile picture</h3>
              <p className="text-xs text-(--v3-muted2) mt-1">Click on the icon to modify your avatar.</p>
            </div>
          </div>
        </section>

        {/* Basic Info Form */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal) ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-(--v3-bg2) border border-(--v3-border) focus:border-(--v3-teal)/50 rounded-xl py-3 pl-12 pr-4 text-sm text-(--v3-text) outline-none transition-all focus:ring-4 focus:ring-(--v3-teal)/5"
                  placeholder="Your name..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal) ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-(--v3-bg2) border border-(--v3-border) focus:border-(--v3-teal)/50 rounded-xl py-3 pl-12 pr-4 text-sm text-(--v3-text) outline-none transition-all focus:ring-4 focus:ring-(--v3-teal)/5"
                  placeholder="Your email..."
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isUpdating || !name || !email || (name === session?.user?.name && email === session?.user?.email)}
            className="w-full py-3.5 bg-(--v3-teal) text-white rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : updateSuccess ? <Check size={18} /> : null}
            {isUpdating ? 'Saving...' : updateSuccess ? 'Saved!' : 'Save changes'}
          </button>
        </section>

        {/* Security Section */}
        <section className="space-y-6 pt-8 border-t border-(--v3-border)">
          <div className="flex flex-col gap-1 ml-1">
            <h3 className="text-sm font-bold text-(--v3-text)">Security</h3>
            <p className="text-[10px] text-(--v3-muted2) uppercase tracking-widest font-black">Change your password</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal) ml-1">Current Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-(--v3-bg2) border border-(--v3-border) focus:border-(--v3-teal)/50 rounded-xl py-3 pl-12 pr-4 text-sm text-(--v3-text) outline-none transition-all focus:ring-4 focus:ring-(--v3-teal)/5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal) ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-(--v3-bg2) border border-(--v3-border) focus:border-(--v3-teal)/50 rounded-xl py-3 pl-12 pr-4 text-sm text-(--v3-text) outline-none transition-all focus:ring-4 focus:ring-(--v3-teal)/5"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal) ml-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-(--v3-bg2) border border-(--v3-border) focus:border-(--v3-teal)/50 rounded-xl py-3 pl-12 pr-4 text-sm text-(--v3-text) outline-none transition-all focus:ring-4 focus:ring-(--v3-teal)/5"
                    placeholder="Confirm password..."
                  />
                </div>
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="bg-(--v3-red)/10 border border-(--v3-red)/20 text-(--v3-red) px-4 py-2.5 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
              {passwordError}
            </div>
          )}

          <button
            onClick={handlePasswordUpdate}
            disabled={isPasswordUpdating || !currentPassword || !newPassword || !confirmPassword}
            className="w-full py-3.5 bg-(--v3-bg3) border border-(--v3-border) text-(--v3-text) hover:border-(--v3-teal)/50 hover:bg-(--v3-bg3)/80 rounded-xl font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isPasswordUpdating ? <Loader2 className="animate-spin" size={18} /> : passwordSuccess ? <Check size={18} /> : null}
            {isPasswordUpdating ? 'Updating...' : passwordSuccess ? 'Updated!' : 'Update password'}
          </button>
        </section>
      </div>

      {(updateSuccess || passwordSuccess) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-(--v3-teal) text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300 z-9999">
          <CheckCircle size={20} className="text-white" />
          <span className="font-bold text-sm">{updateSuccess ? 'Profile updated!' : 'Password updated!'}</span>
        </div>
      )}
    </SettingsLayout>
  )
}
