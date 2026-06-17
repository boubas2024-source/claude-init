'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Building2, User, LogIn } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'

interface NavbarProps {
  isAuthenticated?: boolean
  onLogout?: () => void
}

export function Navbar({ isAuthenticated = false, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/programmes', label: 'Nos Programmes', icon: Building2 },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-navy shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gold rounded-lg p-2 group-hover:bg-gold-400 transition-colors">
              <Building2 className="h-6 w-6 text-navy" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-xl leading-tight">IMAZ</div>
              <div className="text-gold text-xs leading-tight">L&apos;Immobilier de A à Z</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100 hover:bg-white/10 hover:text-white'
                )}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link href="/espace-client">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    Mon Espace
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={onLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/connexion">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <LogIn className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/inscription">
                  <Button variant="secondary" size="sm">
                    S&apos;inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100 hover:bg-white/10 hover:text-white'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4 mr-3" />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/espace-client" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" fullWidth className="text-white hover:bg-white/10">
                      <User className="h-4 w-4 mr-2" />
                      Mon Espace
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" fullWidth onClick={onLogout}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/connexion" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" fullWidth className="text-white hover:bg-white/10 justify-center">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/inscription" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" size="sm" fullWidth>
                      S&apos;inscrire
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
