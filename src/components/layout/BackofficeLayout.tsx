'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react'
import { clsx } from 'clsx'

interface BackofficeLayoutProps {
  children: React.ReactNode
  user?: { nom: string; role: string; email: string }
}

const navItems = [
  { href: '/backoffice/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/backoffice/souscripteurs', label: 'Souscripteurs', icon: Users },
  { href: '/backoffice/guichet', label: 'Guichet / Paiements', icon: CreditCard },
  { href: '/backoffice/catalogue', label: 'Catalogue', icon: Building2 },
  { href: '/backoffice/rapports', label: 'Rapports', icon: BarChart3 },
  { href: '/backoffice/utilisateurs', label: 'Utilisateurs', icon: UserCog },
  { href: '/backoffice/parametres', label: 'Paramètres', icon: Settings },
]

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  RESPONSABLE_PROGRAMME: 'Responsable',
  AGENT_ACCUEIL: 'Agent Accueil',
}

export function BackofficeLayout({ children, user }: BackofficeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/backoffice/auth/logout', { method: 'POST' })
    router.push('/backoffice/login')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-navy shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/backoffice/dashboard" className="flex items-center space-x-2">
            <div className="bg-gold rounded-lg p-1.5">
              <Building2 className="h-5 w-5 text-navy" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">IMAZ</div>
              <div className="text-gold text-xs">Administration</div>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-white/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-gold/20 rounded-full p-2">
                <UserCog className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.nom}</p>
                <p className="text-navy-200 text-xs">{roleLabels[user.role] || user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-white/15 text-white'
                  : 'text-navy-100 hover:bg-white/10 hover:text-white'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon
                className={clsx(
                  'h-5 w-5 mr-3 flex-shrink-0',
                  isActive(item.href) ? 'text-gold' : 'text-navy-200'
                )}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-navy-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-navy-200" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-3"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-navy font-semibold">
                GIE HORONYA — Back-office
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rust" />
            </button>

            {user && (
              <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                <div className="bg-navy rounded-full p-1.5">
                  <UserCog className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.nom}</span>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
