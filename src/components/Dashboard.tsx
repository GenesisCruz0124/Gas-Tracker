import type { FillUp } from '../types'
import {
  averageMpg,
  costPerMile,
  formatMoney,
  monthKey,
  totalForMonth,
} from '../lib/stats'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Dashboard({ fillUps }: { fillUps: FillUp[] }) {
  const now = new Date()
  const thisMonth = monthKey(now.toISOString())
  const monthName = now.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const monthTotal = totalForMonth(fillUps, thisMonth)
  const mpg = averageMpg(fillUps)
  const cpm = costPerMile(fillUps)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={`Spent in ${monthName}`} value={formatMoney(monthTotal)} />
        <StatCard label="Fill-ups logged" value={String(fillUps.length)} />
        <StatCard
          label="Average MPG"
          value={mpg !== null ? mpg.toFixed(1) : '—'}
        />
        <StatCard
          label="Cost per mile"
          value={cpm !== null ? formatMoney(cpm) : '—'}
        />
      </div>
      {fillUps.length < 2 && (
        <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          Log at least two full-tank fill-ups to see your MPG and cost per
          mile.
        </p>
      )}
    </div>
  )
}
