import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="dark relative flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 antialiased selection:bg-indigo-500/30">
            {/* Background spotlight effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div 
                    className="absolute -top-[25%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] blur-[100px]"
                />
            </div>

            <div className="relative w-full max-w-[400px]">
                {/* Subtle outer glow for the card */}
                <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-b from-zinc-800/50 to-transparent opacity-50 blur-lg" />
                
                <div className="relative animate-in fade-in zoom-in-95 duration-700 ease-out">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
