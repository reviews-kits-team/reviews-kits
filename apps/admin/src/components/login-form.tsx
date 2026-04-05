import { useState } from "react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Mail, Lock, LogIn } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    })

    if (error) {
      setError(error.message ?? "Authentication failed.")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-(--v3-teal)">
          // admin
        </span>
        <h1 className="text-3xl font-black tracking-tight text-(--v3-text)">
          Reviewskits
        </h1>
        <p className="text-sm text-(--v3-muted2)">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Card */}
      <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div className="p-3 bg-(--v3-red-dim) border border-(--v3-red)/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-(--v3-red) shrink-0" />
              <p className="text-xs text-(--v3-red)">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal)"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors duration-200">
                <Mail size={15} />
              </div>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-(--v3-bg) border border-(--v3-border) focus:border-(--v3-teal)/50 focus:ring-2 focus:ring-(--v3-teal)/10 rounded-xl py-3 pl-11 pr-4 text-sm text-(--v3-text) placeholder:text-(--v3-muted) outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[11px] font-black uppercase tracking-wider text-(--v3-teal)"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--v3-muted) group-focus-within:text-(--v3-teal) transition-colors duration-200">
                <Lock size={15} />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-(--v3-bg) border border-(--v3-border) focus:border-(--v3-teal)/50 focus:ring-2 focus:ring-(--v3-teal)/10 rounded-xl py-3 pl-11 pr-4 text-sm text-(--v3-text) placeholder:text-(--v3-muted) outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full h-11 flex items-center justify-center gap-2 bg-(--v3-teal) hover:bg-(--v3-teal)/90 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-[0_8px_20px_rgba(13,158,117,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={15} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
