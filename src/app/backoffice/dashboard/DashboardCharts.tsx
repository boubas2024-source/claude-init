'use client'

import { SubscriptionAreaChart, SubscriptionBarChart } from '@/components/dashboard/SubscriptionChart'

interface DashboardChartsProps {
  monthlyData: Array<{
    month: string
    total: number
    validees: number
    enAttente: number
  }>
}

export function DashboardCharts({ monthlyData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SubscriptionAreaChart monthlyData={monthlyData} />
      <SubscriptionBarChart monthlyData={monthlyData} />
    </div>
  )
}
