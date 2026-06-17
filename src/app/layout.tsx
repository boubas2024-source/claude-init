import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: "IMAZ — L'Immobilier de A à Z | GIE HORONYA",
  description:
    "Plateforme de souscription immobilière IMAZ - GIE HORONYA, Burkina Faso. Découvrez nos programmes de logements : DJIGUI, DJIGUIYA, HAKILI, HAKILI SIGUI.",
  keywords: "immobilier, Burkina Faso, logement, souscription, IMAZ, HORONYA, Ouagadougou, Bobo-Dioulasso",
  openGraph: {
    title: "IMAZ — L'Immobilier de A à Z",
    description: "Votre partenaire immobilier de confiance au Burkina Faso",
    type: 'website',
    locale: 'fr_BF',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
