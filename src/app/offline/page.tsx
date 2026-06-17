export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-rust/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M3 3l18 18M6.343 6.343A8.963 8.963 0 003 12c0 4.97 4.03 9 9 9 1.664 0 3.22-.453 4.557-1.243" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Vous êtes hors ligne
        </h1>
        <p className="text-gray-300 mb-2">
          La connexion internet est indisponible.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Les pages du catalogue que vous avez déjà visitées restent accessibles.
          Pour accéder aux disponibilités en temps réel, reconnectez-vous à internet.
        </p>
        <div className="bg-white/10 rounded-xl p-4 text-left text-sm text-gray-300 mb-6">
          <p className="font-medium text-white mb-2">Pages disponibles hors ligne :</p>
          <ul className="space-y-1">
            <li>• Catalogue des programmes</li>
            <li>• Pages produits consultées récemment</li>
            <li>• Formulaire de connexion</li>
          </ul>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-gold text-navy font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
        >
          Retour à la page précédente
        </button>
      </div>
    </div>
  )
}
