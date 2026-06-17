'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  categorie: string
  onCategorieChange: (value: string) => void
  programme: string
  onProgrammeChange: (value: string) => void
  statut: string
  onStatutChange: (value: string) => void
  programmes: Array<{ id: string; nom: string }>
  onReset: () => void
}

const categories = [
  { value: '', label: 'Toutes catégories' },
  { value: 'DJIGUI', label: 'DJIGUI (UHP)' },
  { value: 'DJIGUIYA', label: 'DJIGUIYA (F3/F4)' },
  { value: 'HAKILI', label: 'HAKILI (Villa)' },
  { value: 'HAKILI_SIGUI', label: 'HAKILI SIGUI (Prestige)' },
]

const statuts = [
  { value: '', label: 'Toute disponibilité' },
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVE', label: 'Réservé' },
  { value: 'VENDU', label: 'Vendu' },
]

export function FilterBar({
  search,
  onSearchChange,
  categorie,
  onCategorieChange,
  programme,
  onProgrammeChange,
  statut,
  onStatutChange,
  programmes,
  onReset,
}: FilterBarProps) {
  const hasFilters = search || categorie || programme || statut

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-5 w-5 text-navy" />
        <h3 className="font-semibold text-navy">Filtres</h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center text-sm text-rust hover:text-rust-500 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Référence, programme..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
          />
        </div>

        {/* Category filter */}
        <select
          value={categorie}
          onChange={(e) => onCategorieChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Programme filter */}
        <select
          value={programme}
          onChange={(e) => onProgrammeChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
        >
          <option value="">Tous les programmes</option>
          {programmes.map((prog) => (
            <option key={prog.id} value={prog.id}>
              {prog.nom}
            </option>
          ))}
        </select>

        {/* Statut filter */}
        <select
          value={statut}
          onChange={(e) => onStatutChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
        >
          {statuts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
