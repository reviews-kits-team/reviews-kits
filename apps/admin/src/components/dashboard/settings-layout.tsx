import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Settings, ChevronLeft, Link as LinkIcon } from 'lucide-react'
import { TopBar } from './top-bar'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

const navItems = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Integrations', path: '/integrations', icon: LinkIcon },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export const SettingsLayout = ({ children, title, subtitle }: SettingsLayoutProps) => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-(--v3-bg)">
      <TopBar />
      <main className="max-w-285 mx-auto px-6 py-12">
        <div className="mb-10">
           <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-(--v3-muted2) hover:text-(--v3-teal) transition-colors mb-4"
           >
             <ChevronLeft size={14} /> Back to Dashboard
           </Link>
           <h1 className="text-3xl font-black tracking-tight text-(--v3-text) mb-2">{title}</h1>
           <p className="text-sm text-(--v3-muted2)">{subtitle}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-(--v3-teal) text-white shadow-[0_8px_20px_rgba(45,212,191,0.2)]' 
                        : 'text-(--v3-muted2) hover:bg-white/5 hover:text-(--v3-text)'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
