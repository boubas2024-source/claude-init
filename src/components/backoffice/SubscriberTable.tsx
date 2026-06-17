'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, ArrowUpDown } from 'lucide-react'
import { StatutSouscriptionBadge, CategorieBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Souscription {
  id: string
  numRecu: string
  dateCreation: string
  statut: string
  dateExpiration: string
  client: {
    nom: string
    prenom: string
    telephone: string
    email: string
  }
  produit: {
    reference: string
    categorie: string
    fraisSouscription: number
  }
  programme: {
    nom: string
  }
}

interface SubscriberTableProps {
  souscriptions: Souscription[]
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

export function SubscriberTable({
  souscriptions,
  sortField,
  sortOrder,
  onSort,
}: SubscriberTableProps) {
  const SortableHeader = ({
    field,
    children,
  }: {
    field: string
    children: React.ReactNode
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-navy group"
      onClick={() => onSort?.(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${
            sortField === field ? 'text-navy' : 'text-gray-300 group-hover:text-gray-400'
          }`}
        />
      </div>
    </th>
  )

  if (souscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400">Aucune souscription trouvée</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="numRecu">N° Dossier</SortableHeader>
              <SortableHeader field="client.nom">Client</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programme / Produit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <SortableHeader field="dateCreation">Date</SortableHeader>
              <SortableHeader field="statut">Statut</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frais
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {souscriptions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <span className="font-mono text-sm font-medium text-navy">{s.numRecu}</span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {s.client.prenom} {s.client.nom}
                    </p>
                    <p className="text-xs text-gray-400">{s.client.telephone}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.programme.nom}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.produit.reference}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <CategorieBadge categorie={s.produit.categorie} />
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm text-gray-700">
                      {format(new Date(s.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Exp: {format(new Date(s.dateExpiration), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatutSouscriptionBadge statut={s.statut} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-navy">
                    {s.produit.fraisSouscription.toLocaleString('fr-FR')} FCFA
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link href={`/backoffice/souscripteurs/${s.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
