import Link from 'next/link'
import { Building2, Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gold rounded-lg p-2">
                <Building2 className="h-6 w-6 text-navy" />
              </div>
              <div>
                <div className="font-bold text-xl">IMAZ</div>
                <div className="text-gold text-xs">L&apos;Immobilier de A à Z</div>
              </div>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed">
              GIE HORONYA — Votre partenaire immobilier de confiance au Burkina Faso.
              Des logements de qualité accessibles à tous.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Programmes */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Nos Programmes</h3>
            <ul className="space-y-2">
              <li><Link href="/programmes" className="text-navy-200 hover:text-white text-sm transition-colors">Boromo II</Link></li>
              <li><Link href="/programmes" className="text-navy-200 hover:text-white text-sm transition-colors">Secteur 18 — Ouagadougou</Link></li>
              <li><Link href="/programmes" className="text-navy-200 hover:text-white text-sm transition-colors">Secteur 19 Kodeni — Bobo-Dioulasso</Link></li>
            </ul>
            <h3 className="font-semibold text-gold mb-4 mt-6">Nos Produits</h3>
            <ul className="space-y-2">
              <li><span className="text-navy-200 text-sm">DJIGUI — UHP</span></li>
              <li><span className="text-navy-200 text-sm">DJIGUIYA — F3/F4</span></li>
              <li><span className="text-navy-200 text-sm">HAKILI — Villa standard</span></li>
              <li><span className="text-navy-200 text-sm">HAKILI SIGUI — Villa prestige</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Liens Utiles</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-navy-200 hover:text-white text-sm transition-colors">Accueil</Link></li>
              <li><Link href="/programmes" className="text-navy-200 hover:text-white text-sm transition-colors">Catalogue</Link></li>
              <li><Link href="/auth/inscription" className="text-navy-200 hover:text-white text-sm transition-colors">S&apos;inscrire</Link></li>
              <li><Link href="/auth/connexion" className="text-navy-200 hover:text-white text-sm transition-colors">Espace Client</Link></li>
              <li><Link href="/backoffice/login" className="text-navy-200 hover:text-white text-sm transition-colors">Administration</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-navy-200 text-sm">Ouagadougou, Burkina Faso</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <span className="text-navy-200 text-sm">+226 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <a href="mailto:contact@imaz.bf" className="text-navy-200 hover:text-white text-sm transition-colors">
                  contact@imaz.bf
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-navy-200 text-xs">
                <strong className="text-white">Horaires :</strong><br />
                Lun - Ven : 8h - 17h<br />
                Sam : 8h - 12h
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-navy-300 text-sm">
            © 2024 IMAZ — GIE HORONYA. Tous droits réservés.
          </p>
          <p className="text-navy-300 text-xs mt-2 sm:mt-0">
            Burkina Faso — Logements de qualité pour tous
          </p>
        </div>
      </div>
    </footer>
  )
}
