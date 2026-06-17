'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface MonthlyData {
  month: string
  total: number
  validees: number
  enAttente: number
}

interface CategoryData {
  name: string
  value: number
}

interface SubscriptionChartProps {
  monthlyData: MonthlyData[]
}

const COLORS = ['#1A3A5C', '#C0392B', '#D4A017', '#27AE60']

export function SubscriptionAreaChart({ monthlyData }: SubscriptionChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-navy font-semibold mb-6">Évolution mensuelle des souscriptions</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A3A5C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1A3A5C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorValidees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} />
          <YAxis tick={{ fontSize: 12, fill: '#666' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#1A3A5C"
            strokeWidth={2}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="validees"
            name="Validées"
            stroke="#27AE60"
            strokeWidth={2}
            fill="url(#colorValidees)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SubscriptionBarChart({ monthlyData }: SubscriptionChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-navy font-semibold mb-6">Souscriptions par mois</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} />
          <YAxis tick={{ fontSize: 12, fill: '#666' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="validees" name="Validées" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
          <Bar dataKey="enAttente" name="En attente" fill="#D4A017" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-navy font-semibold mb-6">Répartition par catégorie</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
