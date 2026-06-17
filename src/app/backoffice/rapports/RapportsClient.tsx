'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#1A3A5C', '#C0392B', '#D4A017', '#27AE60']

interface RapportData {
  souscriptionsParProgramme: Array<{ programme: string; count: number }>
  souscriptionsParCategorie: Array<{ categorie: string; count: number }>
  revenusTotal: number
  totalPaiements: number
}

export function RapportsClient({ rapportData }: { rapportData: RapportData }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/backoffice/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!response.ok) throw new Error('Erreur export')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export téléchargé')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-navy">Rapports & Exports</h2>
          <p className="text-gray-500">Statistiques et données exportables</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => handleExport('souscriptions')} isLoading={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Souscriptions Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('clients')} isLoading={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Clients Excel
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Revenus collectés</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-navy">
            {(rapportData.revenusTotal / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-400 mt-1">FCFA</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Paiements validés</h3>
            <TrendingUp className="h-5 w-5 text-navy" />
          </div>
          <p className="text-3xl font-bold text-navy">{rapportData.totalPaiements}</p>
          <p className="text-sm text-gray-400 mt-1">transactions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Programmes actifs</h3>
            <BarChart3 className="h-5 w-5 text-gold" />
          </div>
          <p className="text-3xl font-bold text-navy">{rapportData.souscriptionsParProgramme.length}</p>
          <p className="text-sm text-gray-400 mt-1">programmes</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-navy mb-4">Souscriptions par programme</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rapportData.souscriptionsParProgramme}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="programme" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Souscriptions" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-navy mb-4">Répartition par catégorie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rapportData.souscriptionsParCategorie.map((s) => ({
                  name: s.categorie,
                  value: s.count,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {rapportData.souscriptionsParCategorie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
