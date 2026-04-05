import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-(--v3-bg) px-4 antialiased">
            {/* Teal radial glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] left-1/2 h-200 w-200 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(13,158,117,0.07)_0,transparent_70%)]" />
            </div>

            <div className="relative w-full max-w-105 animate-in fade-in zoom-in-95 duration-500 ease-out">
                <LoginForm />
            </div>
        </div>
    )
}
