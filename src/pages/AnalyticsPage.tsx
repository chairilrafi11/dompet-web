import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMonthlyTrend } from '../api/analytics'
import { formatRupiah } from '../lib/format'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PageHeader from '../components/PageHeader'
import Skeleton from '../components/Skeleton'
import SpotlightCard from '../components/SpotlightCard'
import StatCard from '../components/StatCard'

const tooltipStyle = {
  background: '#111514',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '12px',
  color: '#e7ebe9',
}

export default function AnalyticsPage() {
  const [months, setMonths] = useState(6)
  const trendQ = useQuery({
    queryKey: ['monthly-trend', months],
    queryFn: () => getMonthlyTrend(months),
  })

  const trend = trendQ.data ?? []
  const totalIncome = trend.reduce((s, m) => s + m.income, 0)
  const totalExpense = trend.reduce((s, m) => s + m.expense, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik"
        subtitle="Tren keuangan"
        action={
          <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  months === m
                    ? 'bg-brand-dim font-medium text-brand-bright'
                    : 'text-fg-secondary hover:text-fg-primary'
                }`}
              >
                {m} bln
              </button>
            ))}
          </div>
        }
      />

      {trendQ.isError && (
        <ErrorBanner message="Gagal memuat data analitik." onRetry={() => trendQ.refetch()} />
      )}

      {trendQ.isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : trend.length === 0 ? (
        <EmptyState title="Belum ada data analitik" description="Tren muncul setelah ada transaksi." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Total pemasukan" value={formatRupiah(totalIncome)} tone="income" />
            <StatCard label="Total pengeluaran" value={formatRupiah(totalExpense)} tone="expense" />
          </div>
          <SpotlightCard className="p-5">
            <h3 className="mb-4 font-semibold text-fg-primary">Pemasukan vs Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#9aa4a0', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7672', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(v) => formatRupiah(Number(v))}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#f87171"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </SpotlightCard>
        </>
      )}
    </div>
  )
}
