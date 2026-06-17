'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Building2, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  motDePasse: string
}

interface TwoFAForm {
  code: string
}

export default function BackofficeLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | '2fa'>('login')
  const [tempToken, setTempToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm<LoginForm>()
  const twoFAForm = useForm<TwoFAForm>()

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/backoffice/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Identifiants incorrects')

      if (result.requires2FA) {
        setTempToken(result.tempToken)
        setStep('2fa')
        toast.success('Code 2FA requis')
      } else {
        toast.success('Connexion réussie')
        router.push('/backoffice/dashboard')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  const on2FA = async (data: TwoFAForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/backoffice/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, tempToken }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Code invalide')
      toast.success('Connexion réussie')
      router.push('/backoffice/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Code invalide')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/30 mb-4">
            <Building2 className="h-10 w-10 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white">IMAZ</h1>
          <p className="text-gold text-sm mt-1">L&apos;Immobilier de A à Z</p>
          <p className="text-navy-200 text-sm mt-1">Administration — GIE HORONYA</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {step === 'login' ? (
            <div className="p-8">
              <h2 className="text-xl font-bold text-navy mb-1">Connexion Back-office</h2>
              <p className="text-gray-500 text-sm mb-6">Accès réservé au personnel IMAZ</p>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="form-label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      {...loginForm.register('email', { required: true })}
                      placeholder="admin@imaz.bf"
                      className="form-input pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('motDePasse', { required: true })}
                      placeholder="••••••••"
                      className="form-input pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Se connecter
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-navy/10 rounded-full p-2">
                  <Shield className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">Vérification 2FA</h2>
                  <p className="text-gray-500 text-sm">Entrez votre code d&apos;authentification</p>
                </div>
              </div>

              <form onSubmit={twoFAForm.handleSubmit(on2FA)} className="space-y-4">
                <div>
                  <label className="form-label">Code TOTP (6 chiffres)</label>
                  <input
                    type="text"
                    {...twoFAForm.register('code', { required: true })}
                    placeholder="000000"
                    maxLength={6}
                    className="form-input text-center text-2xl tracking-widest font-mono"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Vérifier
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-sm text-gray-500 hover:text-navy transition-colors text-center"
                >
                  Retour à la connexion
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
