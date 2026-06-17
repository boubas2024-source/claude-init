import Link from 'next/link'
import { ArrowRight, Building2, Home, Shield, Star, MapPin, Users, CheckCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

const programs = [
  {
    id: 'boromo-ii',
    name: 'Boromo II',
    description: '3 000 unités de logements accessibles dans la zone de Boromo',
    ville: 'Zone Boromo',
    units: 3000,
    image: null,
    badge: 'Nouveau',
  },
  {
    id: 'secteur-18',
    name: 'Secteur 18',
    description: 'Logements collectifs modernes au cœur de Ouagadougou',
    ville: 'Ouagadougou',
    units: null,
    image: null,
    badge: 'Populaire',
  },
  {
    id: 'secteur-19-kodeni',
    name: 'Secteur 19 Kodeni',
    description: 'Résidentiel mixte de qualité à Bobo-Dioulasso',
    ville: 'Bobo-Dioulasso',
    units: null,
    image: null,
    badge: null,
  },
]

const categories = [
  {
    name: 'DJIGUI',
    subtitle: 'UHP — Unités d\'Habitation Populaire',
    description: 'Logements abordables pour tous les budgets',
    icon: Home,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'DJIGUIYA',
    subtitle: 'Appartements F3/F4',
    description: 'Appartements spacieux 3 et 4 pièces',
    icon: Building2,
    color: 'bg-navy/5 text-navy border-navy/20',
  },
  {
    name: 'HAKILI',
    subtitle: 'Villa Standard R+1',
    description: 'Villa avec jardin, niveau R+1',
    icon: Home,
    color: 'bg-gold/10 text-gold-600 border-gold/30',
  },
  {
    name: 'HAKILI SIGUI',
    subtitle: 'Villa Prestige Haut de Gamme',
    description: 'L\'excellence du logement au Burkina',
    icon: Star,
    color: 'bg-rust/10 text-rust border-rust/20',
  },
]

const advantages = [
  'Dossier 100% en ligne',
  'Paiement sécurisé en agence',
  'Accompagnement personnalisé',
  'Programmes labellisés GIE HORONYA',
  'Reçu officiel généré instantanément',
  'Support client dédié',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-600 to-navy-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-rust" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold/20 border border-gold/30 mb-6">
              <Star className="h-4 w-4 text-gold mr-2" />
              <span className="text-gold text-sm font-medium">GIE HORONYA — Burkina Faso</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Votre logement de rêve,{' '}
              <span className="text-gold">de A à Z</span>
            </h1>

            <p className="text-xl text-navy-100 mb-8 leading-relaxed">
              IMAZ vous accompagne dans votre projet immobilier au Burkina Faso.
              Des logements accessibles, des programmes certifiés, une souscription simple et rapide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/programmes">
                <Button size="lg" variant="secondary">
                  Découvrir nos programmes
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/inscription">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-navy"
                >
                  Créer mon compte
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-gold">3 000+</p>
                <p className="text-navy-200 text-sm mt-1">Unités disponibles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold">3</p>
                <p className="text-navy-200 text-sm mt-1">Programmes actifs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold">4</p>
                <p className="text-navy-200 text-sm mt-1">Gammes de produits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy">Nos Programmes</h2>
            <p className="text-gray-500 mt-2 text-lg">
              Des projets immobiliers de qualité dans les principales villes du Burkina Faso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                <div className="h-48 bg-gradient-to-br from-navy-100 to-navy-200 relative flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-navy-300" />
                  {prog.badge && (
                    <span className="absolute top-3 left-3 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">
                      {prog.badge}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy group-hover:text-rust transition-colors mb-1">
                    {prog.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {prog.ville}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{prog.description}</p>
                  {prog.units && (
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-navy" />
                      <span className="text-sm font-medium text-navy">
                        {prog.units.toLocaleString('fr-FR')} unités
                      </span>
                    </div>
                  )}
                  <Link href="/programmes">
                    <Button variant="outline" size="sm" fullWidth>
                      Voir le programme
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy">Nos Gammes de Produits</h2>
            <p className="text-gray-500 mt-2 text-lg">
              Un logement adapté à chaque besoin et chaque budget
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-2xl border-2 p-6 ${cat.color} hover:shadow-md transition-all duration-200`}
              >
                <div className="mb-4">
                  <cat.icon className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-sm font-medium opacity-75">{cat.subtitle}</p>
                </div>
                <p className="text-sm opacity-80">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Comment ça marche ?</h2>
            <p className="text-navy-200 mt-2 text-lg">
              Souscrire en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous sur la plateforme avec vos informations personnelles' },
              { step: '02', title: 'Choisissez votre bien', desc: 'Parcourez nos programmes et sélectionnez le logement qui vous convient' },
              { step: '03', title: 'Souscrivez en ligne', desc: 'Complétez votre dossier et téléchargez vos documents en quelques clics' },
              { step: '04', title: 'Payez en agence', desc: 'Rendez-vous dans une agence IMAZ pour finaliser votre paiement' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/20 border-2 border-gold/40 mb-4">
                  <span className="text-gold font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-navy-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Pourquoi choisir IMAZ ?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                GIE HORONYA vous garantit transparence, qualité et accompagnement
                tout au long de votre projet immobilier.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {advantages.map((adv) => (
                  <div key={adv} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{adv}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/programmes">
                  <Button size="lg" variant="primary">
                    Voir nos offres
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy mb-4">
                  <Shield className="h-10 w-10 text-gold" />
                </div>
                <h3 className="text-navy font-bold text-xl">Sécurité garantie</h3>
                <p className="text-gray-500 mt-2">
                  Vos données et transactions sont protégées par les standards les plus élevés
                </p>
              </div>
              <div className="space-y-3">
                {[
                  'Données chiffrées et sécurisées',
                  'Paiement exclusivement en agence physique',
                  'Reçu officiel signé et horodaté',
                  'QR code de vérification unique',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-rust">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à concrétiser votre projet immobilier ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Rejoignez les milliers de Burkinabè qui ont fait confiance à IMAZ — GIE HORONYA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/inscription">
              <Button
                size="lg"
                className="bg-white text-rust hover:bg-gray-100 font-bold"
              >
                Commencer maintenant
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/programmes">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Parcourir le catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
