'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Building2, User, Phone, Mail, Lock, MapPin, Briefcase, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InscriptionPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nationalite: 'Burkinabè' },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription')
      }

      toast.success('Compte créé avec succès !')
      router.push('/auth/connexion')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const InputField = ({
    label,
    name,
    type = 'text',
    placeholder,
    icon: Icon,
    required = false,
    error,
    registerProps,
    rightElement,
  }: {
    label: string
    name: string
    type?: string
    placeholder?: string
    icon?: React.ElementType
    required?: boolean
    error?: string
    registerProps: ReturnType<typeof register>
    rightElement?: React.ReactNode
  }) => (
    <div>
      <label className="form-label">
        {label} {required && <span className="text-rust">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        <input
          type={type}
          {...registerProps}
          placeholder={placeholder}
          className={`form-input ${Icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy mb-4">
            <Building2 className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-navy">Créer un compte IMAZ</h1>
          <p className="text-gray-500 mt-1">
            Rejoignez la plateforme immobilière de référence au Burkina Faso
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Identity */}
            <div>
              <h3 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Informations personnelles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Nom"
                  name="nom"
                  placeholder="Traoré"
                  icon={User}
                  required
                  error={errors.nom?.message}
                  registerProps={register('nom')}
                />
                <InputField
                  label="Prénom"
                  name="prenom"
                  placeholder="Amadou"
                  icon={User}
                  required
                  error={errors.prenom?.message}
                  registerProps={register('prenom')}
                />
                <div>
                  <label className="form-label">Date de naissance</label>
                  <input
                    type="date"
                    {...register('dateNaissance')}
                    className="form-input"
                  />
                </div>
                <InputField
                  label="Lieu de naissance"
                  name="lieuNaissance"
                  placeholder="Ouagadougou"
                  error={errors.lieuNaissance?.message}
                  registerProps={register('lieuNaissance')}
                />
                <InputField
                  label="Nationalité"
                  name="nationalite"
                  placeholder="Burkinabè"
                  required
                  error={errors.nationalite?.message}
                  registerProps={register('nationalite')}
                />
                <InputField
                  label="N° CNIB / Pièce d'identité"
                  name="numIdentite"
                  placeholder="B1234567"
                  error={errors.numIdentite?.message}
                  registerProps={register('numIdentite')}
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Coordonnées
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="amadou@example.com"
                  icon={Mail}
                  required
                  error={errors.email?.message}
                  registerProps={register('email')}
                />
                <InputField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  placeholder="70000000"
                  icon={Phone}
                  required
                  error={errors.telephone?.message}
                  registerProps={register('telephone')}
                />
                <InputField
                  label="Téléphone secondaire"
                  name="telephoneSecondaire"
                  type="tel"
                  placeholder="65000000"
                  icon={Phone}
                  error={errors.telephoneSecondaire?.message}
                  registerProps={register('telephoneSecondaire')}
                />
                <InputField
                  label="Profession"
                  name="profession"
                  placeholder="Ingénieur"
                  icon={Briefcase}
                  error={errors.profession?.message}
                  registerProps={register('profession')}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Adresse
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="Adresse"
                    name="adresse"
                    placeholder="Secteur 15, Quartier Gounghin"
                    icon={MapPin}
                    error={errors.adresse?.message}
                    registerProps={register('adresse')}
                  />
                </div>
                <InputField
                  label="Secteur"
                  name="secteur"
                  placeholder="Secteur 15"
                  error={errors.secteur?.message}
                  registerProps={register('secteur')}
                />
                <InputField
                  label="Ville"
                  name="ville"
                  placeholder="Ouagadougou"
                  error={errors.ville?.message}
                  registerProps={register('ville')}
                />
                <InputField
                  label="Province"
                  name="province"
                  placeholder="Kadiogo"
                  error={errors.province?.message}
                  registerProps={register('province')}
                />
                <InputField
                  label="Source de financement"
                  name="sourceFinancement"
                  placeholder="Salaire, épargne..."
                  error={errors.sourceFinancement?.message}
                  registerProps={register('sourceFinancement')}
                />
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Sécurité
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Mot de passe <span className="text-rust">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('motDePasse')}
                      placeholder="Min. 8 caractères"
                      className="form-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.motDePasse && (
                    <p className="form-error">{errors.motDePasse.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">
                    Confirmer mot de passe <span className="text-rust">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirmMotDePasse')}
                      placeholder="Répétez le mot de passe"
                      className="form-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmMotDePasse && (
                    <p className="form-error">{errors.confirmMotDePasse.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/auth/connexion" className="text-navy font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
