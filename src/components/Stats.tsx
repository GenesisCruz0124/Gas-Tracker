import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppSettings, FillUp } from '../types'
import { efficiencySeries, monthlyTotals, priceSeries } from '../lib/stats'
import { efficiency, efficiencyLabel, priceLabel } from '../lib/units'

function shortMonth(month: string): string {
  return new Date(month + '-01T00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

function shortDate(date: string): string {
  return new Date(date + 'T00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string
  empty: boolean
  children: React.ReactElement
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {empty ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Not enough data yet
        </p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function Stats({
  fillUps,
  settings,
}: {
  fillUps: FillUp[]
  settings: AppSettings
}) {
  const effLabel = efficiencyLabel(settings)
  const months = monthlyTotals(fillUps).map((m) => ({
    ...m,
    label: shortMonth(m.month),
  }))
  const mpg = efficiencySeries(fillUps).map((p) => ({
    mpg: efficiency(p.distance, p.volume, settings),
    label: shortDate(p.date),
  }))
  const prices = priceSeries(fillUps).map((p) => ({
    ...p,
    label: shortDate(p.date),
  }))

  const money = (v: number) => `₱${v.toFixed(2)}`

  return (
    <div className="space-y-4">
      <ChartCard title="Spending by month" empty={months.length === 0}>
        <BarChart data={months}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} tickLine={false} />
          <YAxis fontSize={12} tickLine={false} width={48} tickFormatter={money} />
          <Tooltip formatter={(v) => money(Number(v))} />
          <Bar dataKey="total" name="Spent" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title={`${effLabel} per full tank`} empty={mpg.length < 2}>
        <LineChart data={mpg}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} tickLine={false} />
          <YAxis
            fontSize={12}
            tickLine={false}
            width={40}
            domain={['auto', 'auto']}
          />
          <Tooltip formatter={(v) => `${Number(v).toFixed(1)} ${effLabel}`} />
          <Line
            type="monotone"
            dataKey="mpg"
            name={effLabel}
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartCard>

      <ChartCard
        title={`Gas price (${priceLabel(settings)})`}
        empty={prices.length < 2}
      >
        <LineChart data={prices}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} tickLine={false} />
          <YAxis
            fontSize={12}
            tickLine={false}
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={money}
          />
          <Tooltip formatter={(v) => money(Number(v))} />
          <Line
            type="monotone"
            dataKey="price"
            name={priceLabel(settings)}
            stroke="#ea580c"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartCard>
    </div>
  )
}
