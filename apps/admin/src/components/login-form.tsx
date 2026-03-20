import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      })
    } catch (error) {
      console.error("Login failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-zinc-800/50 bg-zinc-900/40 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-center text-2xl font-bold tracking-tight text-transparent">
            Reviewskits Admin
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Enter your credentials to access the bridge
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="space-y-4">
              <Field className="space-y-2">
                <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-zinc-800 bg-zinc-950/50 transition-all focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </Field>
              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-zinc-500 transition-colors hover:text-indigo-400"
                  >
                    Forgot access?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-zinc-800 bg-zinc-950/50 transition-all focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
              </Field>
            </FieldGroup>

            <div className="space-y-4">
              <Button
                type="submit"
                className="h-11 w-full bg-white font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Authorizing..." : "Sign In to Dashboard"}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-zinc-600">Enterprise Access</span>
                </div>
              </div>

              <Button variant="outline" type="button" className="h-11 w-full border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white">
                Register Command
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="px-8 text-center text-xs text-zinc-600">
        By continuing, you agree to our strictly governed data protocols.
      </p>
    </div>
  )
}
