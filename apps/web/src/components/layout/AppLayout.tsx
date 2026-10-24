import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { LighthouseLogo } from '@/components/brand/LighthouseLogo'
import { Badge } from '@/components/ui/Badge'
import type { AppView } from '@/types/api'
import {
  Activity,
  Compass,
  Database,
  Layers,
  MapPin,
  Menu,
  X,
  Palette,
  ExternalLink,
} from 'lucide-react'

export interface NavItem {
  id: AppView
  label: string
  icon: React.ReactNode
  isLive?: boolean
  description?: string
}

export interface AppLayoutProps {
  currentView: AppView
  onSelectView: (view: AppView) => void
  children: React.ReactNode
}

export const navItems: NavItem[] = [
  {
    id: 'system-status',
    label: 'System Status',
    icon: <Activity className="w-4 h-4" />,
    isLive: true,
    description: 'Live FastAPI backend and dependency connectivity',
  },
  {
    id: 'component-showcase',
    label: 'Design System',
    icon: <Palette className="w-4 h-4" />,
    isLive: true,
    description: 'Accessible UI components and feedback states showcase',
  },
  {
    id: 'profile',
    label: 'Team Profile',
    icon: <Compass className="w-4 h-4" />,
    isLive: false,
    description: 'Phase 1 MVP questionnaire (Planned)',
  },
  {
    id: 'knowledge',
    label: 'Historical Knowledge',
    icon: <Database className="w-4 h-4" />,
    isLive: false,
    description: 'Curated hackathon intelligence base (Planned)',
  },
  {
    id: 'candidates',
    label: 'Candidate Generation',
    icon: <Layers className="w-4 h-4" />,
    isLive: false,
    description: 'Evidence-backed candidate ranking (Planned)',
  },
  {
    id: 'blueprint',
    label: 'Execution Blueprint',
    icon: <MapPin className="w-4 h-4" />,
    isLive: false,
    description: 'Personalised execution path (Planned)',
  },
]

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onSelectView,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (view: AppView) => {
    onSelectView(view)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('system-status')}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lighthouse-500 rounded-lg p-1"
            >
              <LighthouseLogo size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-lighthouse-900">
                    Lighthouse
                  </span>
                  <Badge variant="warning" size="sm">
                    Scaffold
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Personalised hackathon discovery & historical intelligence
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lighthouse-500',
                    isActive
                      ? 'bg-lighthouse-50 text-lighthouse-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {!item.isLive && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      Planned
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Docs / Repo Link & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-lighthouse-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <span>FastAPI Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-lighthouse-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => {
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                    isActive
                      ? 'bg-lighthouse-50 text-lighthouse-700'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {!item.isLive && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      Planned
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Lighthouse</span>
            <span>•</span>
            <span>Phase 1 Frontend Foundation Shell</span>
          </div>
          <div>
            <span>Backend API: </span>
            <code className="text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              /api
            </code>
            <span className="ml-2">•</span>
            <span className="ml-2 text-slate-500">No mock claims or fabricated data</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
