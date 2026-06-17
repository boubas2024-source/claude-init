import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
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
  manifest: '/manifest.json',
  themeColor: '#1A3A5C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IMAZ',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A3A5C" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ServiceWorkerRegistration />
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
